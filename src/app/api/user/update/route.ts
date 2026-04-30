import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { hash } from "bcryptjs";
import { updateUserSettings } from "@/lib/data/users";
import type { UpdateOwnProfileInput } from "@/lib/validations/users";
import { updateOwnProfileSchema } from "@/lib/validations/users";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as UpdateOwnProfileInput;

    const validated = updateOwnProfileSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { name, password, phone, address } = validated.data;

    const updateData: {
      name?: string;
      phone: string | null;
      address: string | null;
      passwordHash?: string;
    } = {
      name: name?.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
    };

    if (password) {
      const passwordHash = await hash(password, 10);
      updateData.passwordHash = passwordHash;
    }

    const updatedUser = await updateUserSettings(session.user.id, updateData);

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
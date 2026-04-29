"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { updateUserSchema, updateOwnProfileSchema } from "@/lib/validations/users";
import { idSchema } from "@/lib/validations/rentals";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function updateUser(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const idParsed = idSchema.safeParse(id);
  if (!idParsed.success) {
    return { success: false, error: "Invalid ID" };
  }

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const [user] = await db
    .update(users)
    .set(parsed.data)
    .where(eq(users.id, id))
    .returning({ id: users.id });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  revalidatePath("/admin/users");

  return { success: true, data: { id: user.id } };
}

export async function updateOwnProfile(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = updateOwnProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const [user] = await db
    .update(users)
    .set(parsed.data)
    .where(eq(users.id, session.user.id))
    .returning({ id: users.id });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  revalidatePath("/dashboard/profile");

  return { success: true, data: { id: user.id } };
}

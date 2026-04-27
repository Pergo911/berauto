import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/actions/auth";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Token is required" },
      { status: 400 }
    );
  }

  const result = await verifyEmail(token);

  if (result.success) {
    return NextResponse.json({ message: result.data?.message });
  } else {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
}
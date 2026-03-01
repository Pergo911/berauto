"use server";

import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { registerSchema } from "@/lib/validations/auth";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function registerUser(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const { name, email, password } = parsed.data;

  // Check if user already exists
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { success: false, error: "Email already registered" };
  }

  const passwordHash = await bcryptjs.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, role: "user" })
    .returning({ id: users.id });

  return { success: true, data: { id: user.id } };
}

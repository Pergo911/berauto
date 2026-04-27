"use server";

import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "@/db";
import { users, passwordResetTokens, emailVerificationTokens } from "@/db/schema";
import { signOut } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
import { forgotPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";

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

  // Generate email verification token
  const verificationToken = nanoid(32);
  await db.insert(emailVerificationTokens).values({
    email,
    token: verificationToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  // TODO: Send verification email
  console.log("Verification token for", email, ":", verificationToken);

  return { success: true, data: { id: user.id } };
}

export async function forgotPassword(
  input: unknown
): Promise<ActionResult<{ message: string }>> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid email address" };
  }

  const { email } = parsed.data;

  // Check if user exists
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    // Don't reveal that the email doesn't exist for security
    return { success: true, data: { message: "If an account exists, a reset link has been sent." } };
  }

  // Generate password reset token
  const token = nanoid(32);
  await db.insert(passwordResetTokens).values({
    email,
    token,
    expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
  });

  // TODO: Send password reset email with token
  console.log("Reset token for", email, ":", token);

  return { success: true, data: { message: "Reset link sent to email" } };
}

export async function resetPassword(
  input: { token: string; password: string }
): Promise<ActionResult<{ message: string }>> {
  const { token, password } = input;

  // Validate token
  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  if (!resetToken) {
    return { success: false, error: "Invalid or expired reset token" };
  }

  if (new Date() > resetToken.expiresAt) {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    return { success: false, error: "Reset token has expired" };
  }

  // Hash new password
  const passwordHash = await bcryptjs.hash(password, 12);

  // Update user password
  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.email, resetToken.email));

  // Delete used token
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token));

  return { success: true, data: { message: "Password reset successfully" } };
}

export async function verifyEmail(token: string): Promise<ActionResult<{ message: string }>> {
  const [verificationToken] = await db
    .select()
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.token, token))
    .limit(1);

  if (!verificationToken) {
    return { success: false, error: "Invalid or expired verification token" };
  }

  if (new Date() > verificationToken.expiresAt) {
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token));
    return { success: false, error: "Verification token has expired" };
  }

  // Update user to set email as verified
  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.email, verificationToken.email));

  // Delete used token
  await db
    .delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.token, token));

  return { success: true, data: { message: "Email verified successfully" } };
}

export async function resendVerificationEmail(email: string): Promise<ActionResult<{ message: string }>> {
  const [user] = await db
    .select({ id: users.id, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.emailVerified) {
    return { success: false, error: "Email already verified" };
  }

  // Generate new verification token
  const token = nanoid(32);
  await db.insert(emailVerificationTokens).values({
    email,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  // TODO: Send verification email
  console.log("New verification token for", email, ":", token);

  return { success: true, data: { message: "Verification email sent" } };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
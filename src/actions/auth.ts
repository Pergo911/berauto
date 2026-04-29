"use server";

import bcryptjs from "bcryptjs";
import { eq, and, gt, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  users,
  emailVerificationTokens,
  passwordResetTokens,
} from "@/db/schema";
import { signOut, auth } from "@/lib/auth";
import { resend } from "@/lib/resend";
import { env } from "@/lib/env";
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import {
  renderEmailVerification,
  emailVerificationSubject,
} from "@/emails/email-verification";
import {
  renderPasswordReset,
  passwordResetSubject,
} from "@/emails/password-reset";

type Locale = "en" | "hu";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

async function sendVerificationEmail(
  userId: string,
  email: string,
  name: string,
  locale: Locale
): Promise<void> {
  // Delete any existing tokens for this user
  await db
    .delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.userId, userId));

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [tokenRow] = await db
    .insert(emailVerificationTokens)
    .values({ userId, locale, expiresAt })
    .returning({ token: emailVerificationTokens.token });

  const verificationUrl = `${getAppUrl()}/api/auth/verify-email?token=${tokenRow.token}`;

  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: [email],
    subject: emailVerificationSubject(locale),
    html: renderEmailVerification({ name, verificationUrl, locale }),
  });

  if (error) {
    console.error("[sendVerificationEmail] Resend error:", error);
  }
}

export async function registerUser(
  input: unknown,
  locale: Locale = "en"
): Promise<ActionResult<{ id: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const { name, email, password } = parsed.data;

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
    .values({ name, email, passwordHash, role: "user", emailVerified: false })
    .returning({ id: users.id });

  // Fire-and-forget: don't fail registration if email fails
  sendVerificationEmail(user.id, email, name, locale).catch((err) =>
    console.error("[registerUser] Failed to send verification email:", err)
  );

  return { success: true, data: { id: user.id } };
}

export async function resendVerificationEmail(
  locale: Locale = "en"
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) return { success: false, error: "User not found" };
  if (user.emailVerified)
    return { success: false, error: "Email already verified" };

  await sendVerificationEmail(user.id, user.email, user.name, locale);

  return { success: true, data: null };
}

export async function requestPasswordReset(
  input: unknown,
  locale: Locale = "en"
): Promise<ActionResult<null>> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid email address" };
  }

  const { email } = parsed.data;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Always return success to prevent user enumeration
  if (!user || !user.passwordHash) {
    return { success: true, data: null };
  }

  // Delete any existing reset tokens for this user
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, user.id));

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  const [tokenRow] = await db
    .insert(passwordResetTokens)
    .values({ userId: user.id, expiresAt })
    .returning({ token: passwordResetTokens.token });

  const resetUrl = `${getAppUrl()}/${locale}/reset-password?token=${tokenRow.token}`;

  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: [email],
    subject: passwordResetSubject(locale),
    html: renderPasswordReset({ name: user.name, resetUrl, locale }),
  });

  if (error) {
    console.error("[requestPasswordReset] Resend error:", error);
  }

  return { success: true, data: null };
}

export async function resetPassword(
  token: string,
  input: unknown
): Promise<ActionResult<null>> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const { password } = parsed.data;

  const [tokenRow] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date()),
        isNull(passwordResetTokens.usedAt)
      )
    )
    .limit(1);

  if (!tokenRow) {
    return { success: false, error: "invalid-token" };
  }

  const passwordHash = await bcryptjs.hash(password, 12);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, tokenRow.userId));

  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, tokenRow.id));

  return { success: true, data: null };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

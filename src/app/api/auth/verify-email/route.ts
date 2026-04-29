import { NextRequest, NextResponse } from "next/server";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/db";
import { users, emailVerificationTokens } from "@/db/schema";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/en/login?error=invalid-token", request.url));
  }

  const [tokenRow] = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.token, token),
        gt(emailVerificationTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!tokenRow) {
    return NextResponse.redirect(
      new URL(`/en/login?error=invalid-token`, request.url)
    );
  }

  const locale = tokenRow.locale as "en" | "hu";

  await db
    .update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, tokenRow.userId));

  await db
    .delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.id, tokenRow.id));

  return NextResponse.redirect(
    new URL(`/${locale}/dashboard?verified=1`, request.url)
  );
}

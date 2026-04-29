import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EmailVerificationBannerClient } from "./email-verification-banner-client";
import { IncompleteProfileBannerClient } from "./incomplete-profile-banner-client";

export async function EmailVerificationBanner() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [user] = await db
    .select({
      emailVerified: users.emailVerified,
      phone: users.phone,
      address: users.address,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) return null;

  if (!user.emailVerified) return <EmailVerificationBannerClient />;

  const profileIncomplete = !user.phone?.trim() || !user.address?.trim();
  if (profileIncomplete) return <IncompleteProfileBannerClient />;

  return null;
}

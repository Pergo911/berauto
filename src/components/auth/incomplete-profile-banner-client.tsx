"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { AccountStatusBanner } from "@/components/shared/account-status-banner";

export function IncompleteProfileBannerClient() {
  const t = useTranslations("Auth.incompleteProfileBanner");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === `/${locale}/dashboard/profile`) return null;

  async function handleGoToProfile() {
    router.push(`/${locale}/dashboard/profile`);
  }

  return (
    <AccountStatusBanner
      message={t("message")}
      actionLabel={t("goToProfileButton")}
      onAction={handleGoToProfile}
      variant="warning"
      dismissible
    />
  );
}

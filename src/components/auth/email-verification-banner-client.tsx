"use client";

import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { AccountStatusBanner } from "@/components/shared/account-status-banner";
import { resendVerificationEmail } from "@/actions/auth";

export function EmailVerificationBannerClient() {
  const t = useTranslations("Auth.emailVerificationBanner");
  const locale = useLocale() as "en" | "hu";

  async function handleResend() {
    const result = await resendVerificationEmail(locale);
    if (result.success) {
      toast.success(t("resendSuccess"));
    } else {
      toast.error(t("resendError"));
    }
  }

  return (
    <AccountStatusBanner
      message={t("message")}
      actionLabel={t("resendButton")}
      onAction={handleResend}
      variant="warning"
      dismissible
    />
  );
}

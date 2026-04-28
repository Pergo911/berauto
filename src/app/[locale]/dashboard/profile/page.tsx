import { getTranslations } from "next-intl/server";

import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations("Profile");
  const { locale } = await params;

  const session = await auth();
  if (!session?.user) redirect({ href: "/login", locale });

  return (
    <div>
      <PageHeader title={t("title")} />
      <p className="text-muted-foreground">{t("comingSoon")}</p>
    </div>
  );
}

import { getTranslations } from "next-intl/server";

import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { UserSettingsForm } from "@/components/settings/user-settings-form";
import { getUserById } from "@/lib/data/users";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations("Profile");
  const { locale } = await params;

  const session = await auth();
  if (!session?.user) redirect({ href: "/login", locale });

  const userId = (session as { user: { id: string; email: string; name: string; role: string } }).user.id;
  const user = await getUserById(userId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <PageHeader title={t("title")} />
        <p className="mt-2 text-sm text-muted-foreground">
          {t("subtitle", { defaultValue: "Manage your account settings and security preferences" })}
        </p>
        <div className="mt-8">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg shadow-black/5 p-8">
            <UserSettingsForm
              initialPhone={user?.phone ?? ""}
              initialAddress={user?.address ?? ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
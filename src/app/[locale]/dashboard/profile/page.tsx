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
    <div>
      <PageHeader title={t("title")} />
      <div className="mt-6 max-w-xl">
        <UserSettingsForm
          initialPhone={user?.phone ?? ""}
          initialAddress={user?.address ?? ""}
        />
      </div>
    </div>
  );
}

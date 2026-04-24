import { Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getUsersByRole } from "@/lib/data/users";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { BackLink } from "@/components/shared/back-link";
import { UsersTable } from "@/components/users/users-table";

export default async function AdminUsersPage() {
  const t = await getTranslations("Admin.usersPage");
  const [admins, agents, regularUsers] = await Promise.all([
    getUsersByRole("admin"),
    getUsersByRole("agent"),
    getUsersByRole("user"),
  ]);

  const staffUsers = [...admins, ...agents];

  return (
    <div>
      <BackLink href="/admin" label={t("backToDashboard")} />
      <PageHeader title={t("title")} className="mb-6" />

      <div className="mb-2 flex items-center gap-3">
        <h2 className="text-xl font-semibold">
          <Users className="mr-2 inline-block size-5" />
          {t("staffTitle")}
        </h2>
        <Badge variant="secondary" className="text-sm">
          {t("members", { count: staffUsers.length })}
        </Badge>
      </div>
      <UsersTable users={staffUsers} />

      <Separator className="my-8" />

      <div className="mb-2 flex items-center gap-3">
        <h2 className="text-xl font-semibold">
          <Users className="mr-2 inline-block size-5" />
          {t("usersTitle")}
        </h2>
        <Badge variant="secondary" className="text-sm">
          {t("usersCount", { count: regularUsers.length })}
        </Badge>
      </div>
      <UsersTable users={regularUsers} />
    </div>
  );
}

import { Users } from "lucide-react";

import { getUsersByRole } from "@/lib/data/users";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { BackLink } from "@/components/shared/back-link";
import { UsersTable } from "@/components/users/users-table";

export default async function AdminUsersPage() {
  const [admins, agents, regularUsers] = await Promise.all([
    getUsersByRole("admin"),
    getUsersByRole("agent"),
    getUsersByRole("user"),
  ]);

  const staffUsers = [...admins, ...agents];

  return (
    <div>
      <BackLink href="/admin" label="Back to Dashboard" />
      <PageHeader title="User Management" className="mb-6" />

      {/* Staff Section */}
      <div className="mb-2 flex items-center gap-3">
        <h2 className="text-xl font-semibold">
          <Users className="mr-2 inline-block size-5" />
          Staff (Admins &amp; Agents)
        </h2>
        <Badge variant="secondary" className="text-sm">
          {staffUsers.length} member{staffUsers.length !== 1 ? "s" : ""}
        </Badge>
      </div>
      <UsersTable users={staffUsers} />

      <Separator className="my-8" />

      {/* Regular Users Section */}
      <div className="mb-2 flex items-center gap-3">
        <h2 className="text-xl font-semibold">
          <Users className="mr-2 inline-block size-5" />
          Users
        </h2>
        <Badge variant="secondary" className="text-sm">
          {regularUsers.length} user{regularUsers.length !== 1 ? "s" : ""}
        </Badge>
      </div>
      <UsersTable users={regularUsers} />
    </div>
  );
}

import { getUsersByRole, searchUsers } from "@/lib/data/users";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { UserSearch } from "@/components/users/user-search";

type SearchParams = Promise<{ q?: string }>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;

  const [admins, agents] = await Promise.all([
    getUsersByRole("admin"),
    getUsersByRole("agent"),
  ]);

  const staffUsers = [...admins, ...agents];

  const searchResults = q && q.length >= 2 ? await searchUsers(q) : null;

  function roleBadge(role: string) {
    const map: Record<string, string> = {
      admin: "bg-red-600 text-white",
      agent: "bg-blue-600 text-white",
      user: "bg-gray-600 text-white",
    };
    return (
      <Badge className={map[role] ?? ""}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">User Management</h1>

      {/* Staff Section */}
      <h2 className="mb-4 text-xl font-semibold">Staff (Admins & Agents)</h2>
      {staffUsers.length === 0 ? (
        <p className="mb-6 text-muted-foreground">No staff users found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden sm:table-cell">Phone</TableHead>
              <TableHead className="hidden md:table-cell">Address</TableHead>
              <TableHead className="hidden lg:table-cell">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{roleBadge(user.role)}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {user.phone ?? "-"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.address ?? "-"}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {formatDate(user.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Separator className="my-8" />

      {/* User Search Section */}
      <h2 className="mb-4 text-xl font-semibold">Search Users</h2>
      <div className="mb-6">
        <UserSearch />
      </div>

      {searchResults === null ? (
        <p className="text-muted-foreground">
          Enter at least 2 characters to search for users.
        </p>
      ) : searchResults.length === 0 ? (
        <p className="text-muted-foreground">
          No users found matching &quot;{q}&quot;.
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}{" "}
            for &quot;{q}&quot;
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden sm:table-cell">Phone</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchResults.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{roleBadge(user.role)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {user.phone ?? "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.address ?? "-"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDate(user.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}

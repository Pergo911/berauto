"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye, Settings2 } from "lucide-react";

import type { UserDTO } from "@/lib/data/users";
import type { UserRole } from "@/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserDetailDialog } from "@/components/users/user-detail-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";

type UsersTableProps = {
  users: UserDTO[];
  /** When true, the role Select filter is shown */
  showRoleFilter?: boolean;
};

const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  admin: "bg-red-600 text-white",
  agent: "bg-blue-600 text-white",
  user: "bg-gray-600 text-white",
};

export function UsersTable({ users, showRoleFilter = false }: UsersTableProps) {
  const t = useTranslations("UsersTable");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);

  const userRoles: { value: UserRole; label: string }[] = useMemo(
    () => [
      { value: "admin", label: t("roles.admin") },
      { value: "agent", label: t("roles.agent") },
      { value: "user", label: t("roles.user") },
    ],
    [t]
  );

  const columnLabels: Record<string, string> = useMemo(
    () => ({
      name: t("columns.name"),
      email: t("columns.email"),
      role: t("columns.role"),
      phone: t("columns.phone"),
      address: t("columns.address"),
      createdAt: t("columns.createdAt"),
    }),
    [t]
  );

  const columns: ColumnDef<UserDTO>[] = useMemo(
    () => [
      {
        id: "name",
        accessorFn: (row) => row.name,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.name")} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "email",
        header: t("columns.email"),
      },
      {
        accessorKey: "role",
        header: t("columns.role"),
        cell: ({ row }) => {
          const role = row.original.role;
          return (
            <Badge className={ROLE_BADGE_CLASSES[role] ?? ""}>
              {t(`roles.${role}`)}
            </Badge>
          );
        },
        filterFn: "equals",
        enableSorting: false,
      },
      {
        accessorKey: "phone",
        header: t("columns.phone"),
        cell: ({ row }) => row.original.phone ?? "—",
      },
      {
        accessorKey: "address",
        header: t("columns.address"),
        cell: ({ row }) => row.original.address ?? "—",
      },
      {
        id: "createdAt",
        accessorFn: (row) => row.createdAt,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.createdAt")} />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.createdAt, locale)}
          </span>
        ),
        sortingFn: "datetime",
      },
      {
        id: "detail",
        header: () => null,
        cell: () => (
          <span className="flex items-center justify-end opacity-0 transition-opacity group-hover/row:opacity-100">
            <Eye className="size-4 text-muted-foreground" />
          </span>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [t, locale]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue ?? "")
        .toLowerCase()
        .trim();
      if (!search) return true;
      const { name, email } = row.original;
      return (
        name.toLowerCase().includes(search) ||
        email.toLowerCase().includes(search)
      );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  const roleFilterValue =
    (table.getColumn("role")?.getFilterValue() as string | undefined) ?? "";

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 py-4">
        <Input
          placeholder={t("searchPlaceholder")}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        {showRoleFilter && (
          <Select
            value={roleFilterValue || "all"}
            onValueChange={(value) =>
              table
                .getColumn("role")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("allRoles")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allRoles")}</SelectItem>
              {userRoles.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden h-8 lg:flex"
              >
                <Settings2 className="mr-2 h-4 w-4" />
                {tCommon("view")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>{tCommon("toggleColumns")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  >
                    {columnLabels[col.id] ?? col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <EmptyState message={t("noUsers")} />
      ) : (
        <>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="group/row cursor-pointer"
                      onClick={() => setSelectedUser(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {tCommon("noResults")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="py-4">
            <DataTablePagination table={table} />
          </div>
        </>
      )}

      {selectedUser && (
        <UserDetailDialog
          user={selectedUser}
          open={!!selectedUser}
          onOpenChange={(open) => {
            if (!open) setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

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

import type { RentalDTO } from "@/lib/data/rentals";
import type { RentalStatus } from "@/types";
import { formatDate } from "@/lib/utils";
import { BrandLogo } from "@/components/cars/brand-logo";
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
import { RentalStatusBadge } from "@/components/rentals/rental-status-badge";
import { RentalDetailDialog } from "@/components/rentals/rental-detail-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";

type RentalTableProps = {
  rentals: RentalDTO[];
  showUser?: boolean;
  hideStatusFilter?: boolean;
  /** "user" = dashboard view, "agent" = agent/admin view */
  variant?: "user" | "agent";
};

type TFn = ReturnType<typeof useTranslations<"RentalTable">>;

function getColumns(
  showUser: boolean,
  t: TFn,
  locale: string
): ColumnDef<RentalDTO>[] {
  const cols: ColumnDef<RentalDTO>[] = [
    {
      id: "car",
      accessorFn: (row) =>
        `${row.car.make} ${row.car.model} ${row.car.licensePlate}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("columns.car")} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          <BrandLogo
            logoPath={row.original.car.brandLogoPath}
            brandName={row.original.car.make}
            size={20}
            className="shrink-0"
          />
          {row.original.car.make} {row.original.car.model}
        </div>
      ),
    },
  ];

  if (showUser) {
    cols.push({
      id: "customer",
      accessorFn: (row) => row.userName ?? row.guestName ?? row.userEmail ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("columns.customer")} />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.userName ?? row.original.guestName ?? tCommon("unknown")}
        </span>
      ),
    });
  }

  cols.push(
    {
      id: "startDate",
      accessorFn: (row) => row.startDate,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("columns.startDate")} />
      ),
      cell: ({ row }) => formatDate(row.original.startDate, locale),
      sortingFn: "datetime",
    },
    {
      id: "endDate",
      accessorFn: (row) => row.endDate,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("columns.endDate")} />
      ),
      cell: ({ row }) => formatDate(row.original.endDate, locale),
      sortingFn: "datetime",
    },
    {
      accessorKey: "status",
      header: t("columns.status"),
      cell: ({ row }) => <RentalStatusBadge status={row.original.status} />,
      filterFn: "equals",
      enableSorting: false,
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
    }
  );

  return cols;
}

export function RentalTable({
  rentals,
  showUser = false,
  hideStatusFilter = false,
  variant = "user",
}: RentalTableProps) {
  const t = useTranslations("RentalTable");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedRental, setSelectedRental] = useState<RentalDTO | null>(null);

  const columns = useMemo(
    () => getColumns(showUser, t, locale),
    [showUser, t, locale]
  );

  const rentalStatuses: { value: RentalStatus; label: string }[] = useMemo(
    () => [
      { value: "PENDING", label: t("statuses.PENDING") },
      { value: "APPROVED", label: t("statuses.APPROVED") },
      { value: "REJECTED", label: t("statuses.REJECTED") },
      { value: "ACTIVE", label: t("statuses.ACTIVE") },
      { value: "CLOSED", label: t("statuses.CLOSED") },
      { value: "CLOSED_INVOICED", label: t("statuses.CLOSED_INVOICED") },
    ],
    [t]
  );

  const columnLabels: Record<string, string> = useMemo(
    () => ({
      car: t("columns.car"),
      customer: t("columns.customer"),
      startDate: t("columns.startDate"),
      endDate: t("columns.endDate"),
      status: t("columns.status"),
      createdAt: t("columns.createdAt"),
    }),
    [t]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rentals,
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
      const { make, model } = row.original.car;
      const customer = row.original.userName ?? row.original.guestName ?? "";
      return (
        make.toLowerCase().includes(search) ||
        model.toLowerCase().includes(search) ||
        `${make} ${model}`.toLowerCase().includes(search) ||
        customer.toLowerCase().includes(search)
      );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  const statusFilterValue =
    (table.getColumn("status")?.getFilterValue() as string | undefined) ?? "";

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 py-4">
        <Input
          placeholder={
            showUser ? t("searchByCarOrCustomer") : t("searchByCar")
          }
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        {!hideStatusFilter && (
          <Select
            value={statusFilterValue || "all"}
            onValueChange={(value) =>
              table
                .getColumn("status")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t("allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatuses")}</SelectItem>
              {rentalStatuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
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
      {rentals.length === 0 ? (
        <EmptyState message={t("noRentals")} />
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
                      onClick={() => setSelectedRental(row.original)}
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

      {selectedRental && (
        <RentalDetailDialog
          rental={selectedRental}
          open={!!selectedRental}
          onOpenChange={(open) => {
            if (!open) setSelectedRental(null);
          }}
          variant={variant}
        />
      )}
    </div>
  );
}

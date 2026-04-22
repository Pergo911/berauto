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
import { Settings2 } from "lucide-react";

import type { InvoiceDTO } from "@/lib/data/invoices";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BrandLogo } from "@/components/cars/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { EmptyState } from "@/components/shared/empty-state";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";

type InvoicesTableProps = {
  invoices: InvoiceDTO[];
};

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const t = useTranslations("InvoicesTable");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const columnLabels: Record<string, string> = useMemo(
    () => ({
      car: t("columns.car"),
      amount: t("columns.amount"),
      issuedAt: t("columns.issuedAt"),
      issuedBy: t("columns.issuedBy"),
    }),
    [t]
  );

  const columns: ColumnDef<InvoiceDTO>[] = useMemo(
    () => [
      {
        id: "car",
        accessorFn: (row) =>
          `${row.car.make} ${row.car.model} ${row.car.year} ${row.car.licensePlate}`,
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
            {row.original.car.make} {row.original.car.model} (
            {row.original.car.year})
          </div>
        ),
      },
      {
        id: "amount",
        accessorFn: (row) => row.amount,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.amount")} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.amount, locale)}
          </span>
        ),
        sortingFn: "basic",
      },
      {
        id: "issuedAt",
        accessorFn: (row) => row.issuedAt,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("columns.issuedAt")} />
        ),
        cell: ({ row }) => formatDate(row.original.issuedAt, locale),
        sortingFn: "datetime",
      },
      {
        id: "issuedBy",
        accessorFn: (row) => row.issuerName ?? "",
        header: t("columns.issuedBy"),
        cell: ({ row }) => row.original.issuerName ?? "—",
      },
    ],
    [t, locale]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: invoices,
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
      const { make, model, year } = row.original.car;
      const issuer = row.original.issuerName ?? "";
      return (
        make.toLowerCase().includes(search) ||
        model.toLowerCase().includes(search) ||
        `${make} ${model}`.toLowerCase().includes(search) ||
        String(year).includes(search) ||
        issuer.toLowerCase().includes(search)
      );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

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
      {invoices.length === 0 ? (
        <EmptyState variant="plain" message={t("noInvoices")} />
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
                    <TableRow key={row.id}>
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
    </div>
  );
}

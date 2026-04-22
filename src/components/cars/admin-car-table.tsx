"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye, Plus, Settings2 } from "lucide-react";

import type { CarDTO } from "@/lib/data/cars";
import type { BrandDTO } from "@/lib/data/brands";
import { formatCurrency } from "@/lib/utils";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CarForm } from "@/components/cars/car-form";
import {
  CarInUseBadge,
  CarStatusBadge,
} from "@/components/cars/car-status-badge";
import { CarDetailDialog } from "@/components/cars/car-detail-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";

type AdminCarTableProps = {
  cars: CarDTO[];
  brands: BrandDTO[];
};

const carGlobalFilterFn: FilterFn<CarDTO> = (_row, _columnId, filterValue) => {
  // handled via getFilteredRowModel + globalFilter applied per-column;
  // return true here — actual logic is in globalFilterFn at table level
  return Boolean(filterValue);
};
carGlobalFilterFn.autoRemove = (val: unknown) =>
  !val || String(val).trim() === "";

type TFn = ReturnType<typeof useTranslations<"AdminCarTable">>;

function getColumns(t: TFn, locale: string): ColumnDef<CarDTO>[] {
  return [
    {
      id: "makeModel",
      accessorFn: (row) => `${row.make} ${row.model}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("columns.makeModel")} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          <BrandLogo
            logoPath={row.original.brandLogoPath}
            brandName={row.original.make}
            size={24}
            className="shrink-0"
          />
          {row.original.make} {row.original.model}
        </div>
      ),
    },
    {
      accessorKey: "year",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("columns.year")} />
      ),
    },
    {
      accessorKey: "licensePlate",
      header: t("columns.licensePlate"),
    },
    {
      accessorKey: "mileageKm",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("columns.mileage")} />
      ),
      cell: ({ row }) =>
        `${row.original.mileageKm.toLocaleString(locale)} km`,
    },
    {
      accessorKey: "dailyRate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("columns.dailyRate")} />
      ),
      cell: ({ row }) => formatCurrency(row.original.dailyRate, locale),
    },
    {
      accessorKey: "status",
      header: t("columns.status"),
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <CarStatusBadge status={row.original.status} />
          {row.original.inUse && <CarInUseBadge />}
        </div>
      ),
      filterFn: "equals",
      enableSorting: false,
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
  ];
}

export function AdminCarTable({ cars, brands }: AdminCarTableProps) {
  const t = useTranslations("AdminCarTable");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarDTO | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(() => getColumns(t, locale), [t, locale]);

  const columnLabels: Record<string, string> = useMemo(
    () => ({
      makeModel: t("columns.makeModel"),
      year: t("columns.year"),
      licensePlate: t("columns.licensePlate"),
      mileageKm: t("columns.mileage"),
      dailyRate: t("columns.dailyRate"),
      status: t("columns.status"),
    }),
    [t]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: cars,
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
      const { make, model, licensePlate } = row.original;
      return (
        make.toLowerCase().includes(search) ||
        model.toLowerCase().includes(search) ||
        `${make} ${model}`.toLowerCase().includes(search) ||
        licensePlate.toLowerCase().includes(search)
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
      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("addNewCarTitle")}</DialogTitle>
            <DialogDescription>{t("addNewCarDesc")}</DialogDescription>
          </DialogHeader>
          <CarForm brands={brands} onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      {selectedCar && (
        <CarDetailDialog
          car={selectedCar}
          brands={brands}
          open={!!selectedCar}
          onOpenChange={(open) => {
            if (!open) setSelectedCar(null);
          }}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 py-4">
        <Input
          placeholder={t("searchPlaceholder")}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
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
            <SelectItem value="AVAILABLE">{t("statusAvailable")}</SelectItem>
            <SelectItem value="MAINTENANCE">{t("statusMaintenance")}</SelectItem>
            <SelectItem value="UNAVAILABLE">{t("statusUnavailable")}</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
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

          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            {t("addNewCar")}
          </Button>
        </div>
      </div>

      {/* Table */}
      {cars.length === 0 ? (
        <EmptyState message={t("noCars")} />
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
                      onClick={() => setSelectedCar(row.original)}
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
    </div>
  );
}

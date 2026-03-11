"use client";

import { useMemo, useState } from "react";
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
import { Pencil, Plus, Settings2 } from "lucide-react";

import type { CarDTO } from "@/lib/data/cars";
import { formatCurrency } from "@/lib/utils";
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
import { DeleteCarButton } from "@/components/cars/delete-car-button";
import {
  CarInUseBadge,
  CarStatusBadge,
} from "@/components/cars/car-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";

type AdminCarTableProps = {
  cars: CarDTO[];
};

const COLUMN_LABELS: Record<string, string> = {
  makeModel: "Make / Model",
  year: "Year",
  licensePlate: "License Plate",
  mileageKm: "Mileage",
  dailyRate: "Daily Rate",
  status: "Status",
};

const carGlobalFilterFn: FilterFn<CarDTO> = (_row, _columnId, filterValue) => {
  // handled via getFilteredRowModel + globalFilter applied per-column;
  // return true here — actual logic is in globalFilterFn at table level
  return Boolean(filterValue);
};
carGlobalFilterFn.autoRemove = (val: unknown) =>
  !val || String(val).trim() === "";

function getColumns(onEdit: (car: CarDTO) => void): ColumnDef<CarDTO>[] {
  return [
    {
      id: "makeModel",
      accessorFn: (row) => `${row.make} ${row.model}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Make / Model" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.make} {row.original.model}
        </span>
      ),
    },
    {
      accessorKey: "year",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Year" />
      ),
    },
    {
      accessorKey: "licensePlate",
      header: "License Plate",
    },
    {
      accessorKey: "mileageKm",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mileage" />
      ),
      cell: ({ row }) => `${row.original.mileageKm.toLocaleString()} km`,
    },
    {
      accessorKey: "dailyRate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Daily Rate" />
      ),
      cell: ({ row }) => formatCurrency(row.original.dailyRate),
    },
    {
      accessorKey: "status",
      header: "Status",
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
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
          <DeleteCarButton
            carId={row.original.id}
            carName={`${row.original.make} ${row.original.model}`}
          />
        </div>
      ),
    },
  ];
}

export function AdminCarTable({ cars }: AdminCarTableProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editCar, setEditCar] = useState<CarDTO | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  // setEditCar is stable (from useState), so this memo runs only once
  const columns = useMemo(() => getColumns(setEditCar), []);

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
            <DialogTitle>Add New Car</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new car to the fleet.
            </DialogDescription>
          </DialogHeader>
          <CarForm onSuccess={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editCar !== null}
        onOpenChange={(open) => {
          if (!open) setEditCar(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Car</DialogTitle>
            <DialogDescription>
              Update the details for {editCar?.make} {editCar?.model}.
            </DialogDescription>
          </DialogHeader>
          {editCar && (
            <CarForm car={editCar} onSuccess={() => setEditCar(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 py-4">
        <Input
          placeholder="Search by make, model, or plate…"
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
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
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
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
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
                    {COLUMN_LABELS[col.id] ?? col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add New Car
          </Button>
        </div>
      </div>

      {/* Table */}
      {cars.length === 0 ? (
        <EmptyState message="No cars found. Add your first car to get started." />
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
                      No results.
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

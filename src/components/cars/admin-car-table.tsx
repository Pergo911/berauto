"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";

import type { CarDTO } from "@/lib/data/cars";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CarForm } from "@/components/cars/car-form";
import { DeleteCarButton } from "@/components/cars/delete-car-button";
import {
  CarInUseBadge,
  CarStatusBadge,
} from "@/components/cars/car-status-badge";
import { EmptyState } from "@/components/shared/empty-state";

type AdminCarTableProps = {
  cars: CarDTO[];
};

export function AdminCarTable({ cars }: AdminCarTableProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editCar, setEditCar] = useState<CarDTO | null>(null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {cars.length} car{cars.length !== 1 ? "s" : ""} in fleet
        </p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Add New Car
        </Button>
      </div>

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

      {/* Table */}
      {cars.length === 0 ? (
        <EmptyState message="No cars found. Add your first car to get started." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Make / Model</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="hidden sm:table-cell">
                License Plate
              </TableHead>
              <TableHead className="hidden md:table-cell">Mileage</TableHead>
              <TableHead>Daily Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.map((car) => (
              <TableRow key={car.id}>
                <TableCell className="font-medium">
                  {car.make} {car.model}
                </TableCell>
                <TableCell>{car.year}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {car.licensePlate}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {car.mileageKm.toLocaleString()} km
                </TableCell>
                <TableCell>{formatCurrency(car.dailyRate)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <CarStatusBadge status={car.status} />
                    {car.inUse && <CarInUseBadge />}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditCar(car)}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <DeleteCarButton
                      carId={car.id}
                      carName={`${car.make} ${car.model}`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

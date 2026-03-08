"use client";

import { useState } from "react";

import type { CarDTO } from "@/lib/data/cars";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

type AdminCarTableProps = {
  cars: CarDTO[];
};

function statusBadge(status: CarDTO["status"]) {
  const map = {
    AVAILABLE: { label: "Available", className: "bg-green-600 text-white" },
    MAINTENANCE: {
      label: "Maintenance",
      className: "bg-yellow-600 text-white",
    },
    UNAVAILABLE: { label: "Unavailable", className: "bg-red-600 text-white" },
  } as const;

  const { label, className } = map[status];
  return <Badge className={className}>{label}</Badge>;
}

export function AdminCarTable({ cars }: AdminCarTableProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editCar, setEditCar] = useState<CarDTO | null>(null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {cars.length} car{cars.length !== 1 ? "s" : ""} in fleet
        </p>
        <Button onClick={() => setCreateOpen(true)}>Add New Car</Button>
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
        <p className="py-8 text-center text-muted-foreground">
          No cars found. Add your first car to get started.
        </p>
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
                <TableCell>{statusBadge(car.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditCar(car)}
                    >
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

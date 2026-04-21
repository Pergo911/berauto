"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Car,
  Eye,
  Loader2,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";

import type { CarDTO } from "@/lib/data/cars";
import type { RentalDTO } from "@/lib/data/rentals";
import type { BrandDTO } from "@/lib/data/brands";
import { BrandLogo } from "@/components/cars/brand-logo";
import { formatDate, formatCurrency } from "@/lib/utils";
import { deleteCar, getCarRentalHistory } from "@/actions/cars";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CarForm } from "@/components/cars/car-form";
import {
  CarInUseBadge,
  CarStatusBadge,
} from "@/components/cars/car-status-badge";
import { RentalStatusBadge } from "@/components/rentals/rental-status-badge";

type CarDetailDialogProps = {
  car: CarDTO;
  brands: BrandDTO[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function RentalHistoryItem({ rental }: { rental: RentalDTO }) {
  const customerName = rental.userName ?? rental.guestName ?? "Unknown";
  const isGuest = !!rental.guestName;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-sm font-medium">
            <User className="size-3.5 text-muted-foreground" />
            {customerName}
          </span>
          {isGuest && (
            <Badge
              variant="outline"
              className="border-amber-500/50 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-400"
            >
              Guest
            </Badge>
          )}
          <RentalStatusBadge status={rental.status} />
        </div>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarDays className="size-3" />
          {formatDate(rental.startDate)} — {formatDate(rental.endDate)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-primary">
          {formatCurrency(
            rental.car.dailyRate *
              Math.ceil(
                (new Date(rental.endDate).getTime() -
                  new Date(rental.startDate).getTime()) /
                  86400000
              )
          )}
        </p>
      </div>
    </div>
  );
}

export function CarDetailDialog({
  car,
  brands,
  open,
  onOpenChange,
}: CarDetailDialogProps) {
  const router = useRouter();
  const [rentalHistory, setRentalHistory] = useState<{
    carId: string;
    data: RentalDTO[];
  } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const loadingHistory = open && rentalHistory?.carId !== car.id;

  useEffect(() => {
    if (!open) return;

    let active = true;
    getCarRentalHistory(car.id).then((result) => {
      if (active && result.success) {
        setRentalHistory({ carId: car.id, data: result.data });
      }
    });
    return () => {
      active = false;
    };
  }, [open, car.id]);

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteCar(car.id);
      if (result.success) {
        setDeleteOpen(false);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="flex items-center gap-2">
              {car.brandLogoPath ? (
                <BrandLogo
                  logoPath={car.brandLogoPath}
                  brandName={car.make}
                  size={20}
                />
              ) : (
                <Car className="size-5 text-muted-foreground" />
              )}
              {car.make} {car.model}
            </DialogTitle>
            <CarStatusBadge status={car.status} />
            {car.inUse && <CarInUseBadge />}
          </div>
          <DialogDescription>
            {car.licensePlate} · {car.year} · {car.mileageKm.toLocaleString()}{" "}
            km
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">
              Details
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              Rental History
              {rentalHistory?.carId === car.id && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {rentalHistory.data.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-6">
            <CarForm
              car={car}
              brands={brands}
              onSuccess={() => {
                onOpenChange(false);
              }}
            />

            <Separator />

            {/* Danger Zone */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-destructive">
                Danger Zone
              </h4>
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Delete this car</p>
                    <p className="text-xs text-muted-foreground">
                      This action cannot be undone. Cars with active or pending
                      rentals cannot be deleted.
                    </p>
                  </div>
                  <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="size-3.5" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Car</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete{" "}
                          <strong>
                            {car.make} {car.model}
                          </strong>
                          ? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : rentalHistory?.data && rentalHistory.data.length > 0 ? (
              <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                {rentalHistory.data.map((rental) => (
                  <RentalHistoryItem key={rental.id} rental={rental} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Car className="mb-2 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No rental history for this car.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/** Icon shown in table rows on hover to indicate clickability */
export function CarDetailHoverIcon() {
  return (
    <span className="flex items-center justify-end opacity-0 transition-opacity group-hover/row:opacity-100">
      <Eye className="size-4 text-muted-foreground" />
    </span>
  );
}

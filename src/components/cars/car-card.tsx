import Link from "next/link";

import type { CarDTO } from "@/lib/data/cars";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CarCardProps = {
  car: CarDTO;
  bookable?: boolean;
};

const statusConfig: Record<
  CarDTO["status"],
  { label: string; className: string }
> = {
  AVAILABLE: {
    label: "Available",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  MAINTENANCE: {
    label: "Maintenance",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  UNAVAILABLE: {
    label: "Unavailable",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
};

export function CarCard({ car, bookable }: CarCardProps) {
  const status = statusConfig[car.status];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">
            {car.make} {car.model}
          </CardTitle>
          <Badge className={cn("shrink-0", status.className)}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Year:</span>{" "}
            {car.year}
          </div>
          <div>
            <span className="font-medium text-foreground">Mileage:</span>{" "}
            {car.mileageKm.toLocaleString("hu-HU")} km
          </div>
          <div className="col-span-2">
            <span className="font-medium text-foreground">License:</span>{" "}
            {car.licensePlate}
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <p className="text-lg font-semibold">
            {formatCurrency(car.dailyRate)}
            <span className="text-sm font-normal text-muted-foreground">
              /day
            </span>
          </p>

          {bookable === false && (
            <Badge variant="destructive">Not available</Badge>
          )}

          <Link href={`/cars/${car.id}`} className="block">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

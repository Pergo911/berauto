import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { getCarById } from "@/lib/data/cars";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/shared/navbar";
import { RentalRequestForm } from "@/components/cars/rental-request-form";
import { CarStatusBadge } from "@/components/cars/car-status-badge";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [car, session] = await Promise.all([getCarById(id), auth()]);

  if (!car) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to all cars
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Car Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-2xl">
                    {car.make} {car.model}
                  </CardTitle>
                  <CardDescription>{car.year} model</CardDescription>
                </div>
                <CarStatusBadge status={car.status} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Make</p>
                  <p className="font-medium">{car.make}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p className="font-medium">{car.model}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="font-medium">{car.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="font-medium">{car.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mileage</p>
                  <p className="font-medium">
                    {car.mileageKm.toLocaleString("hu-HU")} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Added</p>
                  <p className="font-medium">{formatDate(car.createdAt)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Daily Rate</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(car.dailyRate)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /day
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rental Request */}
          <Card>
            <CardHeader>
              <CardTitle>Rental Request</CardTitle>
              <CardDescription>
                {car.status === "AVAILABLE"
                  ? "Submit a rental request for this vehicle."
                  : "This vehicle is currently not available for rental."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {car.status === "AVAILABLE" ? (
                <RentalRequestForm
                  carId={car.id}
                  isLoggedIn={!!session?.user}
                />
              ) : (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    This car is currently{" "}
                    <span className="font-bold lowercase">
                      {car.status == "MAINTENANCE"
                        ? "under maintenance"
                        : "unavailable"}
                    </span>
                    . Please check back later or browse other available
                    vehicles.
                  </p>
                  <Link href="/">
                    <Button variant="outline" className="mt-3">
                      Browse Available Cars
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

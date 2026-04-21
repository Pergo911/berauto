import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { getBookedIntervals, getCarById } from "@/lib/data/cars";
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
import { BackLink } from "@/components/shared/back-link";
import { RentalRequestForm } from "@/components/cars/rental-request-form";
import {
  CarInUseBadge,
  CarStatusBadge,
} from "@/components/cars/car-status-badge";
import { BrandLogo } from "@/components/cars/brand-logo";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [car, session] = await Promise.all([getCarById(id), auth()]);
  const bookedIntervals = car ? await getBookedIntervals(car.id) : [];

  if (!car) {
    notFound();
  }

  const isAvailable = car.status === "AVAILABLE" && !car.inUse;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-8">
        <BackLink href="/" label="Back to all cars" />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Car Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <BrandLogo
                    logoPath={car.brandLogoPath}
                    brandName={car.make}
                    size={48}
                    className="mt-1 shrink-0"
                  />
                  <div>
                    <CardTitle className="text-2xl">
                      {car.make} {car.model}
                    </CardTitle>
                    <CardDescription>{car.year} model</CardDescription>
                  </div>
                </div>
                {car.inUse ? (
                  <CarInUseBadge />
                ) : (
                  <CarStatusBadge status={car.status} />
                )}
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
                {isAvailable
                  ? "Submit a rental request for this vehicle."
                  : "This vehicle is currently not available for rental."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAvailable ? (
                <RentalRequestForm
                  carId={car.id}
                  dailyRate={car.dailyRate}
                  isLoggedIn={!!session?.user}
                  bookedIntervals={bookedIntervals}
                />
              ) : (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    This car is currently{" "}
                    <span className="font-bold">
                      {car.inUse
                        ? "in use"
                        : car.status === "MAINTENANCE"
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

import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

import { auth } from "@/lib/auth";
import { getBookedIntervals, getCarById } from "@/lib/data/cars";
import { formatCurrency, formatDate, toIntlLocale } from "@/lib/utils";
import { getUserById, getRentalBlockReason } from "@/lib/data/users";
import type { RentalBlockReason } from "@/lib/data/users";
import { Link } from "@/i18n/navigation";
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
import { CarStatusBadge } from "@/components/cars/car-status-badge";
import { BrandLogo } from "@/components/cars/brand-logo";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [t, locale, { id }] = await Promise.all([
    getTranslations("CarDetail"),
    getLocale(),
    params,
  ]);

  const [car, session] = await Promise.all([getCarById(id), auth()]);
  const [bookedIntervals, userProfile] = await Promise.all([
    car ? getBookedIntervals(car.id) : Promise.resolve([]),
    session?.user ? getUserById(session.user.id) : Promise.resolve(null),
  ]);

  let blockedReason: RentalBlockReason | null = null;
  if (userProfile) {
    blockedReason = getRentalBlockReason(userProfile);
  }

  if (!car) {
    notFound();
  }

  const isAvailable = car.status === "AVAILABLE";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-8">
        <BackLink href="/" label={t("backToCars")} />

        <div className="grid gap-8 lg:grid-cols-2">
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
                    <CardDescription>
                      {t("modelYear", { year: car.year })}
                    </CardDescription>
                  </div>
                </div>
                <CarStatusBadge status={car.status} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              {/* Car image with overlay */}
              {car.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={car.imageUrl}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 flex items-center gap-2.5 p-4">
                    <BrandLogo
                      logoPath={car.brandLogoPath}
                      brandName={car.make}
                      size={32}
                      className="shrink-0 brightness-0 invert"
                    />
                    <span className="text-base font-bold text-white drop-shadow">
                      {car.make} {car.model}
                    </span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("fields.make")}
                  </p>
                  <p className="font-medium">{car.make}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("fields.model")}
                  </p>
                  <p className="font-medium">{car.model}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("fields.year")}
                  </p>
                  <p className="font-medium">{car.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("fields.licensePlate")}
                  </p>
                  <p className="font-medium">{car.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("fields.mileage")}
                  </p>
                  <p className="font-medium">
                    {car.mileageKm.toLocaleString(toIntlLocale(locale))} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("fields.added")}
                  </p>
                  <p className="font-medium">
                    {formatDate(car.createdAt, locale)}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">
                  {t("fields.dailyRate")}
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(car.dailyRate, locale)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {t("perDay")}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("request.title")}</CardTitle>
              <CardDescription>
                {isAvailable
                  ? t("request.available")
                  : t("request.unavailable")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAvailable ? (
                <RentalRequestForm
                  carId={car.id}
                  dailyRate={car.dailyRate}
                  isLoggedIn={!!session?.user}
                  bookedIntervals={bookedIntervals}
                  blockedReason={blockedReason}
                />
              ) : (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {t("request.currently")}{" "}
                    <span className="font-bold">
                      {car.status === "MAINTENANCE"
                        ? t("request.underMaintenance")
                        : t("request.unavailableStatus")}
                    </span>
                    . {t("request.checkBack")}
                  </p>
                  <Link href="/">
                    <Button variant="outline" className="mt-3">
                      {t("request.browseCars")}
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

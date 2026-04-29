import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Calendar, Car, Gauge, CreditCard } from "lucide-react";
import Image from "next/image";

import type { CarDTO } from "@/lib/data/cars";
import { cn, formatCurrency } from "@/lib/utils";
import { CardContent } from "@/components/ui/card";
import { CarStatusBadge } from "@/components/cars/car-status-badge";
import { BrandLogo } from "@/components/cars/brand-logo";

type CarCardProps = {
  car: CarDTO;
  bookable?: boolean;
};

export async function CarCard({ car, bookable }: CarCardProps) {
  const t = await getTranslations("CarCard");
  const locale = await getLocale();
  const unavailable = bookable === false;
  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl bg-card shadow",
        unavailable && "opacity-70"
      )}
    >
      {/* Hero image — flush to top and sides, borderless */}
      <Link href={`/cars/${car.id}`}>
        <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted">
          {car.imageUrl ? (
            <Image
              src={car.imageUrl}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
              <Car className="size-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Bottom gradient + brand overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-50" />
          <div className="absolute bottom-0 left-0 flex items-center gap-2.5 p-4 transition-opacity duration-300 group-hover:opacity-40">
            <BrandLogo
              logoPath={car.brandLogoPath}
              brandName={car.make}
              size={36}
              className="shrink-0 brightness-0 invert"
            />
            <span className="text-base font-bold leading-tight text-white drop-shadow-md">
              {car.make} {car.model}
            </span>
            {unavailable && <CarStatusBadge status={car.status} />}
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {t("year")}:
              </span>{" "}
              {car.year}
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="size-3.5 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {t("mileage")}:
              </span>{" "}
              {car.mileageKm.toLocaleString(
                locale === "en" ? "en-US" : "hu-HU"
              )}{" "}
              km
            </div>
            <div className="col-span-2 flex items-center gap-1.5">
              <CreditCard className="size-3.5 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {t("license")}:
              </span>{" "}
              {car.licensePlate}
            </div>
          </div>

          <div className="mt-auto pb-4 space-y-3 self-end">
            <p className="text-lg font-semibold">
              {formatCurrency(car.dailyRate, locale)}
              <span className="text-sm font-normal text-muted-foreground">
                {t("perDay")}
              </span>
            </p>
          </div>
        </CardContent>
      </Link>
    </div>
  );
}

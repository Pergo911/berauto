import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Calendar, Gauge, CreditCard, Eye } from "lucide-react";

import type { CarDTO } from "@/lib/data/cars";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className={cn("flex flex-col", unavailable && "opacity-70")}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <BrandLogo
              logoPath={car.brandLogoPath}
              brandName={car.make}
              size={36}
              className="shrink-0"
            />
            <CardTitle className="text-lg">
              {car.make} {car.model}
            </CardTitle>
          </div>
          {unavailable && <CarStatusBadge status={car.status} />}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">{t("year")}:</span>{" "}
            {car.year}
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="size-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">{t("mileage")}:</span>{" "}
            {car.mileageKm.toLocaleString(locale === "en" ? "en-US" : "hu-HU")} km
          </div>
          <div className="col-span-2 flex items-center gap-1.5">
            <CreditCard className="size-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">{t("license")}:</span>{" "}
            {car.licensePlate}
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <p className="text-lg font-semibold">
            {formatCurrency(car.dailyRate, locale)}
            <span className="text-sm font-normal text-muted-foreground">
              {t("perDay")}
            </span>
          </p>
          <Link href={`/cars/${car.id}`} className="block">
            <Button variant="outline" className="w-full">
              <Eye className="size-4" />
              {t("viewDetails")}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

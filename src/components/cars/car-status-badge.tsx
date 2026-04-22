"use client";

import { useTranslations } from "next-intl";

import type { CarStatus } from "@/types";
import { CAR_STATUS } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusVariantConfig: Record<
  CarStatus,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  }
> = {
  [CAR_STATUS.AVAILABLE]: {
    variant: "outline",
    className:
      "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400",
  },
  [CAR_STATUS.MAINTENANCE]: {
    variant: "outline",
    className:
      "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  [CAR_STATUS.UNAVAILABLE]: {
    variant: "destructive",
  },
};

export function CarStatusBadge({ status }: { status: CarStatus }) {
  const t = useTranslations("CarStatusBadge");
  const config = statusVariantConfig[status];
  const labelKey =
    status === CAR_STATUS.AVAILABLE
      ? "available"
      : status === CAR_STATUS.MAINTENANCE
        ? "maintenance"
        : "unavailable";

  return (
    <Badge variant={config.variant} className={cn(config.className)}>
      {t(labelKey)}
    </Badge>
  );
}

/** Badge shown when a car has an ongoing ACTIVE or APPROVED rental. */
export function CarInUseBadge({ className }: { className?: string }) {
  const t = useTranslations("CarStatusBadge");

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400",
        className
      )}
    >
      {t("inUse")}
    </Badge>
  );
}


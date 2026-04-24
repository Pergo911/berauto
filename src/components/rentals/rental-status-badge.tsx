"use client";

import { useTranslations } from "next-intl";

import type { RentalStatus } from "@/types";
import { RENTAL_STATUS } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatusKey =
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "closed"
  | "closedInvoiced";

const statusVariantConfig: Record<
  RentalStatus,
  {
    key: StatusKey;
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  }
> = {
  [RENTAL_STATUS.PENDING]: {
    key: "pending",
    variant: "outline",
    className:
      "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  [RENTAL_STATUS.APPROVED]: {
    key: "approved",
    variant: "outline",
    className:
      "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400",
  },
  [RENTAL_STATUS.REJECTED]: {
    key: "rejected",
    variant: "outline",
    className: "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400",
  },
  [RENTAL_STATUS.ACTIVE]: {
    key: "active",
    variant: "outline",
    className:
      "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  [RENTAL_STATUS.CLOSED]: {
    key: "closed",
    variant: "outline",
    className:
      "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  [RENTAL_STATUS.CLOSED_INVOICED]: {
    key: "closedInvoiced",
    variant: "outline",
    className:
      "border-grey-500/50 bg-grey-500/10 text-grey-700 dark:text-grey-400 text-muted-foreground",
  },
};

export function RentalStatusBadge({ status }: { status: RentalStatus }) {
  const t = useTranslations("RentalStatusBadge");
  const config = statusVariantConfig[status];

  return (
    <Badge variant={config.variant} className={cn(config.className)}>
      {t(config.key)}
    </Badge>
  );
}

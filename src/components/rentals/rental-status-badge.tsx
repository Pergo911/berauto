import type { RentalStatus } from "@/types";
import { RENTAL_STATUS } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  RentalStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  }
> = {
  [RENTAL_STATUS.PENDING]: {
    label: "Pending",
    variant: "outline",
    className:
      "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  [RENTAL_STATUS.APPROVED]: {
    label: "Approved",
    variant: "outline",
    className:
      "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  [RENTAL_STATUS.REJECTED]: {
    label: "Rejected",
    variant: "destructive",
  },
  [RENTAL_STATUS.ACTIVE]: {
    label: "Active",
    variant: "outline",
    className:
      "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400",
  },
  [RENTAL_STATUS.CLOSED]: {
    label: "Closed",
    variant: "secondary",
  },
};

export function RentalStatusBadge({ status }: { status: RentalStatus }) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}

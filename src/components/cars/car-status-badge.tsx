import type { CarStatus } from "@/types";
import { CAR_STATUS } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  CarStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  }
> = {
  [CAR_STATUS.AVAILABLE]: {
    label: "Available",
    variant: "outline",
    className:
      "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400",
  },
  [CAR_STATUS.MAINTENANCE]: {
    label: "Maintenance",
    variant: "outline",
    className:
      "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  [CAR_STATUS.UNAVAILABLE]: {
    label: "Unavailable",
    variant: "destructive",
  },
};

export function CarStatusBadge({ status }: { status: CarStatus }) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}

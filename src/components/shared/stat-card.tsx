import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatCardProps = {
  title: string;
  description: string;
  value: string | number;
  icon: LucideIcon;
  /** If provided, the entire card becomes a clickable link. */
  href?: string;
  /** Size of the numeric value. Defaults to "3xl". */
  valueSize?: "2xl" | "3xl";
  /** Optional sub-label rendered below the value. Disabled when compact is true. */
  subLabel?: string;
  /** When true, value appears beside the title and description; subLabel is disabled. */
  compact?: boolean;
};

const valueSizeClass = {
  "2xl": "text-2xl font-bold",
  "3xl": "text-3xl font-bold",
} as const;

export function StatCard({
  title,
  description,
  value,
  icon: Icon,
  href,
  valueSize = "3xl",
  subLabel,
  compact = false,
}: StatCardProps) {
  const card = (
    <Card
      className={cn(
        // Hero-style gradient background
        "h-full min-w-44 flex-1",
        href &&
          "bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_50%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,253,250,0.95))]",
        href &&
          "dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_50%),linear-gradient(135deg,rgba(15,23,42,0.97),rgba(17,24,39,0.95))]",
        href
          ? "border-border/60 ring-1 ring-primary/30 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/60"
          : "border-border/60"
      )}
    >
      <CardHeader>
        {compact ? (
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex min-w-0 items-center gap-2 text-sm font-medium">
                <span
                  className={cn(
                    "shrink-0 rounded-lg p-1.5",
                    href
                      ? "bg-primary/15 text-primary"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="truncate">{title}</span>
              </CardTitle>
              <div className="flex shrink-0 items-center gap-1.5">
                <p className={cn(valueSizeClass[valueSize], "leading-none")}>
                  {value}
                </p>
                {href && (
                  <ArrowUpRight className="size-4 text-primary opacity-60" />
                )}
              </div>
            </div>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <span
                className={cn(
                  "rounded-xl p-2",
                  href
                    ? "bg-primary/15 text-primary"
                    : "bg-primary/10 text-primary"
                )}
              >
                <Icon className="size-6" />
              </span>
              {href && (
                <ArrowUpRight className="size-5 text-primary opacity-60" />
              )}
            </div>
          </div>
        )}
      </CardHeader>
      {!compact && (
        <CardContent className="flex gap-2 items-baseline">
          <p className={valueSizeClass[valueSize]}>{value}</p>
          {subLabel && (
            <p className="text-sm text-muted-foreground">{subLabel}</p>
          )}
        </CardContent>
      )}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full flex-1">
        {card}
      </Link>
    );
  }
  return card;
}

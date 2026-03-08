import Link from "next/link";
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
  /**
   * "beside" — icon floats to the right of the title (default).
   * "inline" — icon sits inline to the left of the title text.
   */
  iconPosition?: "inline" | "beside";
  /** Optional sub-label rendered below the value. */
  subLabel?: string;
  /** When true, renders the title with a smaller, medium-weight style. */
  compactTitle?: boolean;
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
  iconPosition = "beside",
  subLabel,
  compactTitle = false,
}: StatCardProps) {
  const card = (
    <Card className={cn(href && "transition-shadow hover:shadow-md")}>
      <CardHeader>
        {iconPosition === "inline" ? (
          <CardTitle className="flex items-center gap-2">
            <Icon className="size-5 text-muted-foreground" />
            {title}
          </CardTitle>
        ) : (
          <div className="flex items-center justify-between">
            <CardTitle className={cn(compactTitle && "text-sm font-medium")}>
              {title}
            </CardTitle>
            <Icon className="size-4 text-muted-foreground" />
          </div>
        )}
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className={valueSizeClass[valueSize]}>{value}</p>
        {subLabel && (
          <p className="text-sm text-muted-foreground">{subLabel}</p>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }
  return card;
}

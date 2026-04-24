import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type BackLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function BackLink({ href, label, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "mb-6 inline-flex items-center gap-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      <ChevronLeft className="size-4" />
      {label}
    </Link>
  );
}

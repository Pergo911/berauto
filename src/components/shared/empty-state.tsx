import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  message: string;
  /** "card" wraps in a Card with centered content; "plain" renders a plain paragraph. Default: "plain" */
  variant?: "card" | "plain";
  className?: string;
};

export function EmptyState({
  message,
  variant = "plain",
  className,
}: EmptyStateProps) {
  if (variant === "card") {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <p className={cn("py-8 text-center text-muted-foreground", className)}>
      {message}
    </p>
  );
}

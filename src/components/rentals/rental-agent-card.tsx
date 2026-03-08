import type { ReactNode } from "react";
import { User, UserRoundX, CalendarDays, Car } from "lucide-react";

import type { RentalDTO } from "@/lib/data/rentals";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RentalStatusBadge } from "@/components/rentals/rental-status-badge";

function CustomerTypeBadge({ isRegistered }: { isRegistered: boolean }) {
  if (isRegistered) {
    return (
      <Badge
        variant="outline"
        className="border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400"
      >
        <User className="mr-1 size-3" />
        Registered
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400"
    >
      <UserRoundX className="mr-1 size-3" />
      Guest
    </Badge>
  );
}

type RentalAgentCardProps = {
  rental: RentalDTO;
  /** Action component rendered at the bottom of the card (e.g. ApproveRejectActions, HandoverReturnActions). */
  action: ReactNode;
};

export function RentalAgentCard({ rental, action }: RentalAgentCardProps) {
  const isRegistered = rental.userId !== null;

  return (
    <Card className="border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_50%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,253,250,0.95))] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_50%),linear-gradient(135deg,rgba(15,23,42,0.97),rgba(17,24,39,0.95))]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            <Car className="mr-1.5 inline-block size-4 text-muted-foreground" />
            {rental.car.make} {rental.car.model} ({rental.car.year})
          </CardTitle>
          <RentalStatusBadge status={rental.status} />
        </div>
        <p className="text-xs text-muted-foreground">
          {rental.car.licensePlate}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Customer:</span>
            <span>{rental.userName ?? rental.guestName ?? "Unknown"}</span>
            <CustomerTypeBadge isRegistered={isRegistered} />
          </div>
          <p>
            <span className="font-medium">Email:</span>{" "}
            {rental.userEmail ?? rental.guestEmail ?? "—"}
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3" />
              Start
            </p>
            <p className="font-medium">{formatDate(rental.startDate)}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3" />
              End
            </p>
            <p className="font-medium">{formatDate(rental.endDate)}</p>
          </div>
        </div>

        <Separator />

        {action}
      </CardContent>
    </Card>
  );
}

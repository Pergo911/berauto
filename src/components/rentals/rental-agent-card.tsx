import type { ReactNode } from "react";
import { CalendarDays, Car, User } from "lucide-react";

import type { RentalDTO } from "@/lib/data/rentals";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RentalStatusBadge } from "@/components/rentals/rental-status-badge";
import { NoteDisplay } from "@/components/rentals/note-display";

type RentalAgentCardProps = {
  rental: RentalDTO;
  /** Action component rendered at the bottom of the card (e.g. ApproveRejectActions, HandoverReturnActions). */
  action: ReactNode;
};

export function RentalAgentCard({ rental, action }: RentalAgentCardProps) {
  const email = rental.userEmail ?? rental.guestEmail;

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
          <p className="flex flex-wrap items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            {rental.guestName ? (
              <>
                {rental.guestName}
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  Guest
                </span>
              </>
            ) : (
              (rental.userName ?? "—")
            )}
          </p>
          {email && <p className="text-xs text-muted-foreground">{email}</p>}
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

        <NoteDisplay notes={rental.requestNotes} />

        <Separator />

        {action}
      </CardContent>
    </Card>
  );
}

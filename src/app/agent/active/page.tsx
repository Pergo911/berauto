import { getRentals } from "@/lib/data/rentals";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RentalStatusBadge } from "@/components/rentals/rental-status-badge";
import { HandoverReturnActions } from "@/components/rentals/handover-return-actions";

export default async function AgentActivePage() {
  const rentals = await getRentals({
    status: ["APPROVED", "ACTIVE"],
    sort: "oldest",
  });

  const awaitingHandover = rentals.filter((r) => r.status === "APPROVED");
  const currentlyActive = rentals.filter((r) => r.status === "ACTIVE");

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Active Rentals</h1>

      {/* Awaiting Handover section */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Awaiting Handover
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({awaitingHandover.length})
          </span>
        </h2>

        {awaitingHandover.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No rentals awaiting handover
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {awaitingHandover.map((rental) => (
              <RentalCard
                key={rental.id}
                rental={rental}
                actionType="handover"
              />
            ))}
          </div>
        )}
      </section>

      {/* Currently Active section */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Currently Active
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({currentlyActive.length})
          </span>
        </h2>

        {currentlyActive.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No active rentals</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentlyActive.map((rental) => (
              <RentalCard key={rental.id} rental={rental} actionType="return" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function RentalCard({
  rental,
  actionType,
}: {
  rental: Awaited<ReturnType<typeof getRentals>>[number];
  actionType: "handover" | "return";
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
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
          <p>
            <span className="font-medium">Customer:</span>{" "}
            {rental.userName ?? rental.guestName ?? "Unknown"}
          </p>
          <p>
            <span className="font-medium">Email:</span>{" "}
            {rental.userEmail ?? rental.guestEmail ?? "—"}
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Start</p>
            <p className="font-medium">{formatDate(rental.startDate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">End</p>
            <p className="font-medium">{formatDate(rental.endDate)}</p>
          </div>
        </div>

        <Separator />

        <HandoverReturnActions rentalId={rental.id} type={actionType} />
      </CardContent>
    </Card>
  );
}

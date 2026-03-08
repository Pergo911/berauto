import { getRentals } from "@/lib/data/rentals";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RentalStatusBadge } from "@/components/rentals/rental-status-badge";
import { ApproveRejectActions } from "@/components/rentals/approve-reject-actions";

export default async function AgentRequestsPage() {
  const pendingRentals = await getRentals({
    status: "PENDING",
    sort: "oldest",
  });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Rental Requests</h1>

      {pendingRentals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No pending requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pendingRentals.map((rental) => (
            <Card key={rental.id}>
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
                    <p className="font-medium">
                      {formatDate(rental.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End</p>
                    <p className="font-medium">{formatDate(rental.endDate)}</p>
                  </div>
                </div>

                <Separator />

                <ApproveRejectActions rentalId={rental.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

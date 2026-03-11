import { getRentals } from "@/lib/data/rentals";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RentalAgentCard } from "@/components/rentals/rental-agent-card";
import { ApproveRejectActions } from "@/components/rentals/approve-reject-actions";
import { RentalTable } from "@/components/rentals/rental-table";

export default async function AgentRequestsPage() {
  const [pendingRentals, pastRentals] = await Promise.all([
    getRentals({ status: "PENDING", sort: "oldest" }),
    getRentals({ status: "REJECTED", sort: "newest" }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <PageHeader title="Rental Requests" className="mb-6" />

        {pendingRentals.length === 0 ? (
          <EmptyState variant="plain" message="No pending requests" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingRentals.map((rental) => (
              <RentalAgentCard
                key={rental.id}
                rental={rental}
                action={<ApproveRejectActions rentalId={rental.id} />}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Past Requests
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({pastRentals.length})
          </span>
        </h2>
        <RentalTable rentals={pastRentals} showUser hideStatusFilter />
      </section>
    </div>
  );
}

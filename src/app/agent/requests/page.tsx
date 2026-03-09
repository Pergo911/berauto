import { getRentals } from "@/lib/data/rentals";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RentalAgentCard } from "@/components/rentals/rental-agent-card";
import { ApproveRejectActions } from "@/components/rentals/approve-reject-actions";

export default async function AgentRequestsPage() {
  const pendingRentals = await getRentals({
    status: "PENDING",
    sort: "oldest",
  });

  return (
    <div>
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
    </div>
  );
}

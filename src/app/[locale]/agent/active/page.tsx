import { getTranslations } from "next-intl/server";

import { getRentals } from "@/lib/data/rentals";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { BackLink } from "@/components/shared/back-link";
import { RentalAgentCard } from "@/components/rentals/rental-agent-card";
import { HandoverReturnActions } from "@/components/rentals/handover-return-actions";
import { RentalTable } from "@/components/rentals/rental-table";

export default async function AgentActivePage() {
  const t = await getTranslations("Agent.active");
  const [rentals, pastRentals] = await Promise.all([
    getRentals({ status: ["APPROVED", "ACTIVE"], sort: "newest" }),
    getRentals({ status: ["CLOSED", "CLOSED_INVOICED"], sort: "newest" }),
  ]);

  const awaitingHandover = rentals.filter((r) => r.status === "APPROVED");
  const currentlyActive = rentals.filter((r) => r.status === "ACTIVE");

  return (
    <div className="space-y-10">
      <BackLink href="/agent" label={t("backToDashboard")} />
      <PageHeader title={t("title")} />

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          {t("awaitingHandover")}
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({awaitingHandover.length})
          </span>
        </h2>

        {awaitingHandover.length === 0 ? (
          <EmptyState variant="plain" message={t("emptyAwaiting")} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {awaitingHandover.map((rental) => (
              <RentalAgentCard
                key={rental.id}
                rental={rental}
                action={
                  <HandoverReturnActions
                    rentalId={rental.id}
                    type="handover"
                    lastMileageKm={rental.lastMileageKm}
                  />
                }
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          {t("currentlyActive")}
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({currentlyActive.length})
          </span>
        </h2>

        {currentlyActive.length === 0 ? (
          <EmptyState variant="plain" message={t("emptyActive")} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentlyActive.map((rental) => (
              <RentalAgentCard
                key={rental.id}
                rental={rental}
                action={
                  <HandoverReturnActions
                    rentalId={rental.id}
                    type="return"
                    lastMileageKm={rental.lastMileageKm}
                  />
                }
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          {t("pastRentals")}
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({pastRentals.length})
          </span>
        </h2>
        <RentalTable
          rentals={pastRentals}
          showUser
          hideStatusFilter
          variant="agent"
        />
      </section>
    </div>
  );
}

import { ClipboardList, CarFront, FileText } from "lucide-react";

import { getAgentDashboardStats } from "@/lib/data/dashboard";
import { getRentals } from "@/lib/data/rentals";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { RentalTable } from "@/components/rentals/rental-table";

const statCards = [
  {
    key: "pendingRentals" as const,
    title: "Requests",
    description: "Manage rental requests",
    href: "/agent/requests",
    icon: ClipboardList,
    subLabel: "pending now",
  },
  {
    key: "activeRentals" as const,
    title: "Rentals",
    description: "Manage active rentals",
    href: "/agent/active",
    icon: CarFront,
    subLabel: "active rentals",
  },
  {
    key: "closedRentalsWithoutInvoice" as const,
    title: "Invoices",
    description: "View and manage rental invoices",
    href: "/agent/invoices",
    icon: FileText,
    subLabel: "uninvoiced rentals",
  },
];

export default async function AgentPage() {
  const [stats, allRentals] = await Promise.all([
    getAgentDashboardStats(),
    getRentals({ sort: "newest" }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <PageHeader title="Agent Dashboard" className="mb-6" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <StatCard
              key={card.key}
              title={card.title}
              description={card.description}
              value={stats[card.key]}
              icon={card.icon}
              href={card.href}
              subLabel={card.subLabel}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Rental History
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({allRentals.length})
          </span>
        </h2>
        <RentalTable rentals={allRentals} showUser variant="agent" />
      </section>
    </div>
  );
}

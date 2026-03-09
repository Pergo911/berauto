import { ClipboardList, CarFront, FileText, CircleCheck } from "lucide-react";

import { getAgentDashboardStats } from "@/lib/data/dashboard";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";

const statCards = [
  {
    key: "pendingRentals" as const,
    title: "Pending Requests",
    description: "Rental requests awaiting review",
    href: "/agent/requests",
    icon: ClipboardList,
  },
  {
    key: "activeRentals" as const,
    title: "Active Rentals",
    description: "Currently active rentals",
    href: "/agent/active",
    icon: CarFront,
  },
  {
    key: "closedRentalsWithoutInvoice" as const,
    title: "Uninvoiced Closed",
    description: "Closed rentals awaiting invoice",
    href: "/agent/invoices",
    icon: FileText,
  },
  {
    key: "availableCars" as const,
    title: "Available Cars",
    description: "Cars ready for rental",
    href: "/agent/active",
    icon: CircleCheck,
  },
];

export default async function AgentPage() {
  const stats = await getAgentDashboardStats();

  return (
    <div>
      <PageHeader title="Agent Dashboard" className="mb-6" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard
            key={card.key}
            title={card.title}
            description={card.description}
            value={stats[card.key]}
            icon={card.icon}
            href={card.href}
            compactTitle
          />
        ))}
      </div>
    </div>
  );
}

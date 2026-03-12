import {
  Car,
  CircleCheck,
  Wrench,
  ClipboardList,
  Clock,
  CarFront,
  FileText,
  DollarSign,
  Users,
  UserCog,
} from "lucide-react";

import { getAdminDashboardStats } from "@/lib/data/dashboard";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";

export default async function AdminPage() {
  const stats = await getAdminDashboardStats();

  const statCards = [
    {
      title: "Total Cars",
      description: "Vehicles in the fleet",
      value: stats.totalCars,
      icon: Car,
    },
    {
      title: "Available Cars",
      description: "Ready for rental",
      value: stats.availableCars,
      icon: CircleCheck,
    },
    {
      title: "Maintenance",
      description: "Cars under maintenance",
      value: stats.maintenanceCars,
      icon: Wrench,
    },
    {
      title: "Total Rentals",
      description: "All-time rentals",
      value: stats.totalRentals,
      icon: ClipboardList,
    },
    {
      title: "Pending Rentals",
      description: "Awaiting approval",
      value: stats.pendingRentals,
      icon: Clock,
    },
    {
      title: "Active Rentals",
      description: "Currently ongoing",
      value: stats.activeRentals,
      icon: CarFront,
    },
    {
      title: "Total Invoices",
      description: "Invoices issued",
      value: stats.totalInvoices,
      icon: FileText,
    },
    {
      title: "Revenue",
      description: "Total invoiced amount",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
    },
    {
      title: "Users",
      description: "Registered users",
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: "Agents",
      description: "Agent accounts",
      value: stats.totalAgents,
      icon: UserCog,
    },
  ];

  return (
    <div>
      <PageHeader title="Admin Dashboard" className="mb-6" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            description={card.description}
            value={card.value}
            icon={card.icon}
            valueSize="2xl"
            compact
          />
        ))}
      </div>
    </div>
  );
}

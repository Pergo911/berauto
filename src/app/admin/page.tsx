import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminDashboardStats } from "@/lib/data/dashboard";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPage() {
  const stats = await getAdminDashboardStats();

  const statCards = [
    {
      title: "Total Cars",
      description: "Vehicles in the fleet",
      value: stats.totalCars,
    },
    {
      title: "Available Cars",
      description: "Ready for rental",
      value: stats.availableCars,
    },
    {
      title: "Maintenance",
      description: "Cars under maintenance",
      value: stats.maintenanceCars,
    },
    {
      title: "Total Rentals",
      description: "All-time rentals",
      value: stats.totalRentals,
    },
    {
      title: "Pending Rentals",
      description: "Awaiting approval",
      value: stats.pendingRentals,
    },
    {
      title: "Active Rentals",
      description: "Currently ongoing",
      value: stats.activeRentals,
    },
    {
      title: "Total Invoices",
      description: "Invoices issued",
      value: stats.totalInvoices,
    },
    {
      title: "Revenue",
      description: "Total invoiced amount",
      value: formatCurrency(stats.totalRevenue),
    },
    {
      title: "Users",
      description: "Registered users",
      value: stats.totalUsers,
    },
    {
      title: "Agents",
      description: "Agent accounts",
      value: stats.totalAgents,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

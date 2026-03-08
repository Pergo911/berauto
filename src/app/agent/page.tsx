import Link from "next/link";
import { ClipboardList, CarFront, FileText, CircleCheck } from "lucide-react";

import { getAgentDashboardStats } from "@/lib/data/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <h1 className="mb-6 text-3xl font-bold">Agent Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.key} href={card.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {card.title}
                    </CardTitle>
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats[card.key]}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { Car, Clock, Loader } from "lucide-react";

import { auth } from "@/lib/auth";
import { getUserDashboardStats } from "@/lib/data/dashboard";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const stats = await getUserDashboardStats(session.user.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader title="Dashboard" />
        <Link href="/dashboard/rentals">
          <Button variant="outline" size="sm">
            View all rentals
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Rentals"
          description="Your complete rental history."
          value={stats.totalRentals}
          icon={Car}
          iconPosition="inline"
          subLabel="Total rentals"
        />
        <StatCard
          title="Active Rentals"
          description="Currently active rentals."
          value={stats.activeRentals}
          icon={Clock}
          iconPosition="inline"
          subLabel="Active now"
        />
        <StatCard
          title="Pending Requests"
          description="Rentals awaiting approval."
          value={stats.pendingRentals}
          icon={Loader}
          iconPosition="inline"
          subLabel="Pending approval"
        />
      </div>
    </div>
  );
}

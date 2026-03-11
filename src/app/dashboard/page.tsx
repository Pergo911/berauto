import Link from "next/link";
import { redirect } from "next/navigation";
import { Car, Clock, Loader } from "lucide-react";

import { auth } from "@/lib/auth";
import { getUserDashboardStats } from "@/lib/data/dashboard";
import { getRentals } from "@/lib/data/rentals";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { RentalTable } from "@/components/rentals/rental-table";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [stats, rentals] = await Promise.all([
    getUserDashboardStats(session.user.id),
    getRentals({ userId: session.user.id }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <PageHeader title="Dashboard" />
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
            Welcome back, {session.user.name}
          </p>
        </div>
        <Button asChild>
          <Link href="/#available-cars">
            <Car className="mr-2 h-4 w-4" />
            Rent a Car
          </Link>
        </Button>
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Rentals"
          description="Your complete rental history."
          value={stats.totalRentals}
          icon={Car}
          compact
        />
        <StatCard
          title="Active Rentals"
          description="Currently active rentals."
          value={stats.activeRentals}
          icon={Clock}
          compact
        />
        <StatCard
          title="Pending Requests"
          description="Rentals awaiting approval."
          value={stats.pendingRentals}
          icon={Loader}
          compact
        />
      </div>

      <h2 className="mb-4 text-xl font-semibold">My Rentals</h2>
      <RentalTable rentals={rentals} />
    </div>
  );
}

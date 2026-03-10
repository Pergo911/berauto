import Link from "next/link";
import { redirect } from "next/navigation";
import { Car, Clock, Loader } from "lucide-react";

import type { RentalStatus } from "@/types";
import { RENTAL_STATUS } from "@/types";
import { auth } from "@/lib/auth";
import { getUserDashboardStats } from "@/lib/data/dashboard";
import { getRentals } from "@/lib/data/rentals";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { FilterStrip } from "@/components/rentals/filter-strip";
import { RentalTable } from "@/components/rentals/rental-table";

type SearchParams = Promise<{ status?: string }>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { status } = await searchParams;

  const validStatuses = Object.values(RENTAL_STATUS) as string[];
  const statusFilter =
    status && validStatuses.includes(status)
      ? (status as RentalStatus)
      : undefined;

  const [stats, rentals] = await Promise.all([
    getUserDashboardStats(session.user.id),
    getRentals({ userId: session.user.id, status: statusFilter }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <PageHeader title="Dashboard" />
          <p className="mt-1 text-muted-foreground">
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

      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">My Rentals</h2>
        <FilterStrip activeStatus={statusFilter} />
      </div>
      <RentalTable rentals={rentals} />
    </div>
  );
}

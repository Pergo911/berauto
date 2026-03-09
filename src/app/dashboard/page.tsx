import { redirect } from "next/navigation";
import { Car, Clock, Loader } from "lucide-react";

import type { RentalStatus } from "@/types";
import { RENTAL_STATUS } from "@/types";
import { auth } from "@/lib/auth";
import { getUserDashboardStats } from "@/lib/data/dashboard";
import { getRentals } from "@/lib/data/rentals";
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
      <div className="mb-6">
        <PageHeader title="Dashboard" />
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">My Rentals</h2>
        <FilterStrip activeStatus={statusFilter} />
      </div>
      <RentalTable rentals={rentals} />
    </div>
  );
}

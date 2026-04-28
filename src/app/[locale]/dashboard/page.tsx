import { Car, Clock, Loader, Settings } from "lucide-react";
import type { Session } from "next-auth";
import { getTranslations } from "next-intl/server";

import { auth } from "@/lib/auth";
import { getUserDashboardStats } from "@/lib/data/dashboard";
import { getRentals } from "@/lib/data/rentals";
import { Link, redirect } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { RentalTable } from "@/components/rentals/rental-table";

function ensureUser(
  user: Session["user"] | undefined,
  locale: string
): asserts user is Session["user"] {
  if (!user) {
    redirect({ href: "/login", locale });
  }
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations("Dashboard");
  const { locale } = await params;

  const session = await auth();
  const user = session?.user;

  ensureUser(user, locale);

  const [stats, rentals] = await Promise.all([
    getUserDashboardStats(user.id),
    getRentals({ userId: user.id }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <PageHeader title={t("title")} />
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
            {t("welcomeBack", { name: user.name })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/profile">
              <Settings className="mr-2 h-4 w-4" />
              {t("profileButton")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/#available-cars">
              <Car className="mr-2 h-4 w-4" />
              {t("rentButton")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title={t("stats.totalRentals.title")}
          description={t("stats.totalRentals.description")}
          value={stats.totalRentals}
          icon={Car}
          compact
        />
        <StatCard
          title={t("stats.activeRentals.title")}
          description={t("stats.activeRentals.description")}
          value={stats.activeRentals}
          icon={Clock}
          compact
        />
        <StatCard
          title={t("stats.pendingRequests.title")}
          description={t("stats.pendingRequests.description")}
          value={stats.pendingRentals}
          icon={Loader}
          compact
        />
      </div>

      <h2 className="mb-4 text-xl font-semibold">{t("myRentals")}</h2>
      <RentalTable rentals={rentals} />
    </div>
  );
}

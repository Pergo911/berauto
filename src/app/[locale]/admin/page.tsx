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
import { getLocale, getTranslations } from "next-intl/server";

import { getAdminDashboardStats } from "@/lib/data/dashboard";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";

export default async function AdminPage() {
  const [t, locale, stats] = await Promise.all([
    getTranslations("Admin.dashboard"),
    getLocale(),
    getAdminDashboardStats(),
  ]);

  const navCards = [
    {
      key: "totalCars" as const,
      title: t("navCards.cars.title"),
      description: t("navCards.cars.description"),
      href: "/admin/cars",
      icon: Car,
      subLabel: t("navCards.cars.subLabel"),
    },
    {
      key: "totalUsers" as const,
      title: t("navCards.users.title"),
      description: t("navCards.users.description"),
      href: "/admin/users",
      icon: Users,
      subLabel: t("navCards.users.subLabel"),
    },
  ];

  const statCards = [
    {
      title: t("stats.totalCars.title"),
      description: t("stats.totalCars.description"),
      value: stats.totalCars,
      icon: Car,
    },
    {
      title: t("stats.availableCars.title"),
      description: t("stats.availableCars.description"),
      value: stats.availableCars,
      icon: CircleCheck,
    },
    {
      title: t("stats.maintenance.title"),
      description: t("stats.maintenance.description"),
      value: stats.maintenanceCars,
      icon: Wrench,
    },
    {
      title: t("stats.totalRentals.title"),
      description: t("stats.totalRentals.description"),
      value: stats.totalRentals,
      icon: ClipboardList,
    },
    {
      title: t("stats.pendingRentals.title"),
      description: t("stats.pendingRentals.description"),
      value: stats.pendingRentals,
      icon: Clock,
    },
    {
      title: t("stats.activeRentals.title"),
      description: t("stats.activeRentals.description"),
      value: stats.activeRentals,
      icon: CarFront,
    },
    {
      title: t("stats.totalInvoices.title"),
      description: t("stats.totalInvoices.description"),
      value: stats.totalInvoices,
      icon: FileText,
    },
    {
      title: t("stats.revenue.title"),
      description: t("stats.revenue.description"),
      value: formatCurrency(stats.totalRevenue, locale),
      icon: DollarSign,
    },
    {
      title: t("stats.users.title"),
      description: t("stats.users.description"),
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: t("stats.agents.title"),
      description: t("stats.agents.description"),
      value: stats.totalAgents,
      icon: UserCog,
    },
  ];

  return (
    <div className="space-y-10">
      <section>
        <PageHeader title={t("title")} className="mb-6" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {navCards.map((card) => (
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
        <h2 className="mb-4 text-xl font-semibold">{t("overview")}</h2>
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
      </section>
    </div>
  );
}

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { cars, invoices, rentals, users } from "@/db/schema";

// ── DTOs ───────────────────────────────────────────────

export type UserDashboardStats = {
  totalRentals: number;
  activeRentals: number;
  pendingRentals: number;
};

export type AgentDashboardStats = {
  pendingRentals: number;
  activeRentals: number;
  closedRentalsWithoutInvoice: number;
  availableCars: number;
};

export type AdminDashboardStats = {
  totalCars: number;
  availableCars: number;
  maintenanceCars: number;
  totalRentals: number;
  pendingRentals: number;
  activeRentals: number;
  totalInvoices: number;
  totalRevenue: number;
  totalUsers: number;
  totalAgents: number;
};

// ── Queries ────────────────────────────────────────────

/** Counts relevant to the authenticated user's dashboard. */
export async function getUserDashboardStats(
  userId: string
): Promise<UserDashboardStats> {
  const [result] = await db
    .select({
      totalRentals: sql<number>`count(*)::int`,
      activeRentals: sql<number>`count(*) filter (where ${rentals.status} = 'ACTIVE')::int`,
      pendingRentals: sql<number>`count(*) filter (where ${rentals.status} = 'PENDING')::int`,
    })
    .from(rentals)
    .where(eq(rentals.userId, userId));

  return result;
}

/** Counts relevant to the agent dashboard. */
export async function getAgentDashboardStats(): Promise<AgentDashboardStats> {
  const [[rentalCounts], [carCounts], [uninvoiced]] = await Promise.all([
    db
      .select({
        pendingRentals: sql<number>`count(*) filter (where ${rentals.status} = 'PENDING')::int`,
        activeRentals: sql<number>`count(*) filter (where ${rentals.status} = 'ACTIVE')::int`,
      })
      .from(rentals),

    db
      .select({
        availableCars: sql<number>`count(*) filter (where ${cars.status} = 'AVAILABLE' and not exists (
          select 1 from "rentals" where "rentals"."car_id" = "cars"."id" and "rentals"."status" in ('ACTIVE', 'APPROVED')
        ))::int`,
      })
      .from(cars),

    db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(rentals)
      .leftJoin(invoices, eq(rentals.id, invoices.rentalId))
      .where(sql`${rentals.status} = 'CLOSED' AND ${invoices.id} IS NULL`),
  ]);

  return {
    pendingRentals: rentalCounts.pendingRentals,
    activeRentals: rentalCounts.activeRentals,
    closedRentalsWithoutInvoice: uninvoiced.count,
    availableCars: carCounts.availableCars,
  };
}

/** Counts relevant to the admin dashboard. */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [[carCounts], [rentalCounts], [invoiceCounts], [userCounts]] =
    await Promise.all([
      db
        .select({
          totalCars: sql<number>`count(*)::int`,
          availableCars: sql<number>`count(*) filter (where ${cars.status} = 'AVAILABLE' and not exists (
            select 1 from "rentals" where "rentals"."car_id" = "cars"."id" and "rentals"."status" in ('ACTIVE', 'APPROVED')
          ))::int`,
          maintenanceCars: sql<number>`count(*) filter (where ${cars.status} = 'MAINTENANCE')::int`,
        })
        .from(cars),

      db
        .select({
          totalRentals: sql<number>`count(*)::int`,
          pendingRentals: sql<number>`count(*) filter (where ${rentals.status} = 'PENDING')::int`,
          activeRentals: sql<number>`count(*) filter (where ${rentals.status} = 'ACTIVE')::int`,
        })
        .from(rentals),

      db
        .select({
          totalInvoices: sql<number>`count(*)::int`,
          totalRevenue: sql<number>`coalesce(sum(${invoices.amount}::numeric), 0)::float8`,
        })
        .from(invoices),

      db
        .select({
          totalUsers: sql<number>`count(*)::int`,
          totalAgents: sql<number>`count(*) filter (where ${users.role} = 'agent')::int`,
        })
        .from(users),
    ]);

  return {
    totalCars: carCounts.totalCars,
    availableCars: carCounts.availableCars,
    maintenanceCars: carCounts.maintenanceCars,
    totalRentals: rentalCounts.totalRentals,
    pendingRentals: rentalCounts.pendingRentals,
    activeRentals: rentalCounts.activeRentals,
    totalInvoices: invoiceCounts.totalInvoices,
    totalRevenue: invoiceCounts.totalRevenue,
    totalUsers: userCounts.totalUsers,
    totalAgents: userCounts.totalAgents,
  };
}

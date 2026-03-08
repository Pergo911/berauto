import {
  and,
  asc,
  desc,
  eq,
  gt,
  ilike,
  inArray,
  lt,
  ne,
  or,
  sql,
} from "drizzle-orm";

import type { CarStatus } from "@/types";
import { db } from "@/db";
import { cars, rentals } from "@/db/schema";

// ── DTO ────────────────────────────────────────────────

export type CarDTO = {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  mileageKm: number;
  dailyRate: number;
  status: CarStatus;
  createdAt: Date;
  updatedAt: Date;
};

/** Convert a raw `cars` row to a page-ready DTO (numeric → number). */
function toCarDTO(row: typeof cars.$inferSelect): CarDTO {
  return {
    ...row,
    dailyRate: Number(row.dailyRate),
  };
}

// ── Queries ────────────────────────────────────────────

/** List cars with optional search, status filter, and sort order. */
export async function getCars(filters?: {
  search?: string;
  status?: CarStatus;
  sort?:
    | "price-asc"
    | "price-desc"
    | "year-asc"
    | "year-desc"
    | "mileage-asc"
    | "mileage-desc";
}): Promise<CarDTO[]> {
  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(cars.status, filters.status));
  }

  if (filters?.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(cars.make, term),
        ilike(cars.model, term),
        ilike(cars.licensePlate, term)
      )!
    );
  }

  let orderBy;
  switch (filters?.sort) {
    case "price-asc":
      orderBy = asc(cars.dailyRate);
      break;
    case "price-desc":
      orderBy = desc(cars.dailyRate);
      break;
    case "year-asc":
      orderBy = asc(cars.year);
      break;
    case "year-desc":
      orderBy = desc(cars.year);
      break;
    case "mileage-asc":
      orderBy = asc(cars.mileageKm);
      break;
    case "mileage-desc":
      orderBy = desc(cars.mileageKm);
      break;
    default:
      orderBy = desc(cars.createdAt);
  }

  const rows = await db
    .select()
    .from(cars)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy);

  return rows.map(toCarDTO);
}

/** Get a single car by ID, or `null` if not found. */
export async function getCarById(id: string): Promise<CarDTO | null> {
  const [row] = await db.select().from(cars).where(eq(cars.id, id)).limit(1);
  return row ? toCarDTO(row) : null;
}

/**
 * Check whether a car is bookable for the given date range.
 * A car is bookable when its status is AVAILABLE **and** no overlapping
 * APPROVED or ACTIVE rental exists.
 */
export async function isCarBookable(
  carId: string,
  startDate: Date,
  endDate: Date,
  excludeRentalId?: string
): Promise<boolean> {
  const car = await getCarById(carId);
  if (!car || car.status !== "AVAILABLE") return false;

  const overlapConditions = [
    eq(rentals.carId, carId),
    inArray(rentals.status, ["APPROVED", "ACTIVE"]),
    lt(rentals.startDate, endDate),
    gt(rentals.endDate, startDate),
  ];

  if (excludeRentalId) {
    overlapConditions.push(ne(rentals.id, excludeRentalId));
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(rentals)
    .where(and(...overlapConditions));

  return result.count === 0;
}

/**
 * Return PENDING rentals that overlap the given date range for a car,
 * excluding `excludeRentalId`. Used when approving a rental to auto-reject
 * conflicting pending requests.
 */
export async function getConflictingPendingRentals(
  carId: string,
  startDate: Date,
  endDate: Date,
  excludeRentalId: string
) {
  const rows = await db
    .select()
    .from(rentals)
    .where(
      and(
        eq(rentals.carId, carId),
        eq(rentals.status, "PENDING"),
        ne(rentals.id, excludeRentalId),
        lt(rentals.startDate, endDate),
        gt(rentals.endDate, startDate)
      )
    );

  return rows;
}

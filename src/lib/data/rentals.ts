import { and, asc, desc, eq, gt, inArray, lt, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import type { RentalStatus } from "@/types";
import { db } from "@/db";
import { cars, rentalEvents, rentals, users } from "@/db/schema";

// ── Table aliases (self-join on users) ─────────────────

const userRef = alias(users, "userRef");
const agentRef = alias(users, "agentRef");
const actorRef = alias(users, "actorRef");

// ── DTOs ───────────────────────────────────────────────

export type RentalDTO = {
  id: string;
  carId: string;
  car: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  startDate: Date;
  endDate: Date;
  status: RentalStatus;
  agentId: string | null;
  agentName: string | null;
  createdAt: Date;
  updatedAt: Date;
  /** Most recent mileage reading: latest rental-event mileage, falling back to the car's stored mileage. */
  lastMileageKm: number | null;
  /** Notes from the initial REQUEST event, if any. */
  requestNotes: string | null;
};

export type RentalEventDTO = {
  id: string;
  rentalId: string;
  eventType: string;
  actorId: string | null;
  actorName: string | null;
  notes: string | null;
  mileageKm: number | null;
  timestamp: Date;
};

// ── Row → DTO helpers ──────────────────────────────────

type RentalRow = {
  rental: typeof rentals.$inferSelect;
  carMake: string | null;
  carModel: string | null;
  carYear: number | null;
  carLicensePlate: string | null;
  carMileageKm: number;
  lastEventMileageKm: number | null;
  requestNotes: string | null;
  userName: string | null;
  userEmail: string | null;
  agentName: string | null;
};

function toRentalDTO(row: RentalRow): RentalDTO {
  return {
    id: row.rental.id,
    carId: row.rental.carId,
    car: {
      make: row.carMake ?? "",
      model: row.carModel ?? "",
      year: row.carYear ?? 0,
      licensePlate: row.carLicensePlate ?? "",
    },
    userId: row.rental.userId,
    userName: row.userName,
    userEmail: row.userEmail,
    guestName: row.rental.guestName,
    guestEmail: row.rental.guestEmail,
    guestPhone: row.rental.guestPhone,
    startDate: row.rental.startDate,
    endDate: row.rental.endDate,
    status: row.rental.status,
    agentId: row.rental.agentId,
    agentName: row.agentName,
    createdAt: row.rental.createdAt,
    updatedAt: row.rental.updatedAt,
    lastMileageKm: row.lastEventMileageKm ?? row.carMileageKm,
    requestNotes: row.requestNotes,
  };
}

// ── Queries ────────────────────────────────────────────

/** List rentals with optional filters. Includes joined car, user, and agent info. */
export async function getRentals(filters?: {
  status?: RentalStatus | RentalStatus[];
  carId?: string;
  userId?: string;
  agentId?: string;
  sort?: "newest" | "oldest";
}): Promise<RentalDTO[]> {
  const conditions = [];

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      conditions.push(inArray(rentals.status, filters.status));
    } else {
      conditions.push(eq(rentals.status, filters.status));
    }
  }
  if (filters?.carId) conditions.push(eq(rentals.carId, filters.carId));
  if (filters?.userId) conditions.push(eq(rentals.userId, filters.userId));
  if (filters?.agentId) conditions.push(eq(rentals.agentId, filters.agentId));

  const orderBy =
    filters?.sort === "oldest"
      ? asc(rentals.createdAt)
      : desc(rentals.createdAt);

  const rows = await db
    .select({
      rental: rentals,
      carMake: cars.make,
      carModel: cars.model,
      carYear: cars.year,
      carLicensePlate: cars.licensePlate,
      carMileageKm: cars.mileageKm,
      lastEventMileageKm: sql<number | null>`(
        SELECT mileage_km FROM rental_events
        WHERE rental_id = ${rentals.id}
          AND mileage_km IS NOT NULL
        ORDER BY "timestamp" DESC
        LIMIT 1
      )`,
      requestNotes: sql<string | null>`(
        SELECT notes FROM rental_events
        WHERE rental_id = ${rentals.id}
          AND event_type = 'REQUEST'
        LIMIT 1
      )`,
      userName: userRef.name,
      userEmail: userRef.email,
      agentName: agentRef.name,
    })
    .from(rentals)
    .innerJoin(cars, eq(rentals.carId, cars.id))
    .leftJoin(userRef, eq(rentals.userId, userRef.id))
    .leftJoin(agentRef, eq(rentals.agentId, agentRef.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy);

  return rows.map(toRentalDTO);
}

/** Get a single rental by ID with car, user, and agent info. */
export async function getRentalById(id: string): Promise<RentalDTO | null> {
  const [row] = await db
    .select({
      rental: rentals,
      carMake: cars.make,
      carModel: cars.model,
      carYear: cars.year,
      carLicensePlate: cars.licensePlate,
      carMileageKm: cars.mileageKm,
      lastEventMileageKm: sql<number | null>`(
        SELECT mileage_km FROM rental_events
        WHERE rental_id = ${rentals.id}
          AND mileage_km IS NOT NULL
        ORDER BY "timestamp" DESC
        LIMIT 1
      )`,
      requestNotes: sql<string | null>`(
        SELECT notes FROM rental_events
        WHERE rental_id = ${rentals.id}
          AND event_type = 'REQUEST'
        LIMIT 1
      )`,
      userName: userRef.name,
      userEmail: userRef.email,
      agentName: agentRef.name,
    })
    .from(rentals)
    .innerJoin(cars, eq(rentals.carId, cars.id))
    .leftJoin(userRef, eq(rentals.userId, userRef.id))
    .leftJoin(agentRef, eq(rentals.agentId, agentRef.id))
    .where(eq(rentals.id, id))
    .limit(1);

  return row ? toRentalDTO(row) : null;
}

/** Get all events for a rental, ordered chronologically, with actor names. */
export async function getRentalEvents(
  rentalId: string
): Promise<RentalEventDTO[]> {
  const rows = await db
    .select({
      event: rentalEvents,
      actorName: actorRef.name,
    })
    .from(rentalEvents)
    .leftJoin(actorRef, eq(rentalEvents.actorId, actorRef.id))
    .where(eq(rentalEvents.rentalId, rentalId))
    .orderBy(asc(rentalEvents.timestamp));

  return rows.map((r) => ({
    id: r.event.id,
    rentalId: r.event.rentalId,
    eventType: r.event.eventType,
    actorId: r.event.actorId,
    actorName: r.actorName,
    notes: r.event.notes,
    mileageKm: r.event.mileageKm,
    timestamp: r.event.timestamp,
  }));
}

/**
 * Returns `true` when at least one APPROVED or ACTIVE rental overlaps
 * the given date range for a specific car (excluding an optional rental ID).
 */
export async function hasOverlappingApprovedOrActive(
  carId: string,
  startDate: Date,
  endDate: Date,
  excludeRentalId?: string
): Promise<boolean> {
  const conditions = [
    eq(rentals.carId, carId),
    inArray(rentals.status, ["APPROVED", "ACTIVE"]),
    lt(rentals.startDate, endDate),
    gt(rentals.endDate, startDate),
  ];

  if (excludeRentalId) {
    conditions.push(ne(rentals.id, excludeRentalId));
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(rentals)
    .where(and(...conditions));

  return result.count > 0;
}

"use server";

import { and, eq, gt, lt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { cars, rentalEvents, rentals, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { isCarBookable, getConflictingPendingRentals } from "@/lib/data/cars";
import { getRentalEvents, getRentalById } from "@/lib/data/rentals";
import { getUserById } from "@/lib/data/users";
import {
  createRentalSchema,
  idSchema,
  mileageWithNotesSchema,
  rejectReasonSchema,
} from "@/lib/validations/rentals";

import type { RentalEventDTO } from "@/lib/data/rentals";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ── 1. Create Rental Request ───────────────────────────

export async function createRentalRequest(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = createRentalSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const session = await auth();

  const {
    carId,
    startDate,
    endDate,
    notes,
    guestName,
    guestEmail,
    guestPhone,
  } = parsed.data;

  // If not logged in, require guest fields
  if (!session?.user) {
    if (!guestName || !guestEmail || !guestPhone) {
      return {
        success: false,
        error:
          "Guest name, email, and phone are required for non-registered users",
      };
    }
  }

  const [rental] = await db
    .insert(rentals)
    .values({
      carId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "PENDING",
      // Attach userId if logged in, otherwise use guest fields
      userId: session?.user ? session.user.id : null,
      guestName: session?.user ? null : (guestName ?? null),
      guestEmail: session?.user ? null : (guestEmail ?? null),
      guestPhone: session?.user ? null : (guestPhone ?? null),
    })
    .returning({ id: rentals.id });

  await db.insert(rentalEvents).values({
    rentalId: rental.id,
    eventType: "REQUEST",
    actorId: session?.user ? session.user.id : null,
    notes: notes ?? null,
  });

  revalidatePath("/");
  revalidatePath("/agent/requests");

  return { success: true, data: { id: rental.id } };
}

// ── 2. Get Approval Conflicts ──────────────────────────

export async function getApprovalConflicts(rentalId: string): Promise<
  ActionResult<{
    conflicts: Array<{
      id: string;
      startDate: Date;
      endDate: Date;
      renterName: string | null;
    }>;
  }>
> {
  const idParsed = idSchema.safeParse(rentalId);
  if (!idParsed.success) {
    return { success: false, error: "Invalid ID" };
  }

  const session = await auth();
  if (
    !session ||
    (session.user.role !== "agent" && session.user.role !== "admin")
  ) {
    return { success: false, error: "Unauthorized" };
  }

  const [rental] = await db
    .select()
    .from(rentals)
    .where(eq(rentals.id, rentalId))
    .limit(1);

  if (!rental) {
    return { success: false, error: "Rental not found" };
  }

  if (rental.status !== "PENDING") {
    return { success: false, error: "Rental is not pending" };
  }

  const conflicting = await db
    .select({
      id: rentals.id,
      startDate: rentals.startDate,
      endDate: rentals.endDate,
      guestName: rentals.guestName,
      userName: users.name,
    })
    .from(rentals)
    .leftJoin(users, eq(rentals.userId, users.id))
    .where(
      and(
        eq(rentals.carId, rental.carId),
        eq(rentals.status, "PENDING"),
        ne(rentals.id, rentalId),
        lt(rentals.startDate, rental.endDate),
        gt(rentals.endDate, rental.startDate)
      )
    );

  const conflicts = conflicting.map((c) => ({
    id: c.id,
    startDate: c.startDate,
    endDate: c.endDate,
    renterName: c.guestName ?? c.userName ?? null,
  }));

  return { success: true, data: { conflicts } };
}

// ── 3. Approve Rental ──────────────────────────────────

export async function approveRental(
  rentalId: string,
  options?: {
    autoRejectConflicts?: boolean;
    notes?: string;
    conflictNotes?: Record<string, string>;
  }
): Promise<ActionResult<{ id: string }>> {
  const idParsed = idSchema.safeParse(rentalId);
  if (!idParsed.success) {
    return { success: false, error: "Invalid ID" };
  }

  const session = await auth();
  if (
    !session ||
    (session.user.role !== "agent" && session.user.role !== "admin")
  ) {
    return { success: false, error: "Unauthorized" };
  }

  const [rental] = await db
    .select()
    .from(rentals)
    .where(eq(rentals.id, rentalId))
    .limit(1);

  if (!rental) {
    return { success: false, error: "Rental not found" };
  }

  if (rental.status !== "PENDING") {
    return { success: false, error: "Rental is not pending" };
  }

  const bookable = await isCarBookable(
    rental.carId,
    rental.startDate,
    rental.endDate
  );

  if (!bookable) {
    return {
      success: false,
      error: "Car is not available for the requested dates",
    };
  }

  // Approve the rental
  // Note: neon-http driver does not support traditional transactions,
  // so we run statements sequentially. This is acceptable for this use case
  // because the prior bookability check guards against conflicts.
  const now = new Date();

  await db
    .update(rentals)
    .set({
      status: "APPROVED",
      agentId: session.user.id,
      updatedAt: now,
    })
    .where(eq(rentals.id, rentalId));

  await db.insert(rentalEvents).values({
    rentalId,
    eventType: "APPROVE",
    actorId: session.user.id,
    notes: options?.notes ?? null,
  });

  // Auto-reject conflicting PENDING rentals
  if (options?.autoRejectConflicts) {
    const conflicts = await getConflictingPendingRentals(
      rental.carId,
      rental.startDate,
      rental.endDate,
      rentalId
    );

    for (const conflict of conflicts) {
      await db
        .update(rentals)
        .set({
          status: "REJECTED",
          agentId: session.user.id,
          updatedAt: now,
        })
        .where(eq(rentals.id, conflict.id));

      const defaultConflictNote =
        "Sorry, this request was automatically rejected because another rental was approved for the same dates.";
      await db.insert(rentalEvents).values({
        rentalId: conflict.id,
        eventType: "REJECT",
        actorId: session.user.id,
        notes:
          options?.conflictNotes?.[conflict.id]?.trim() || defaultConflictNote,
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/agent/requests");
  revalidatePath("/agent/active");
  revalidatePath("/dashboard/rentals");

  return { success: true, data: { id: rentalId } };
}

// ── 4. Reject Rental ───────────────────────────────────

export async function rejectRental(
  rentalId: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const idParsed = idSchema.safeParse(rentalId);
  if (!idParsed.success) {
    return { success: false, error: "Invalid ID" };
  }

  const parsed = rejectReasonSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const session = await auth();
  if (
    !session ||
    (session.user.role !== "agent" && session.user.role !== "admin")
  ) {
    return { success: false, error: "Unauthorized" };
  }

  const [rental] = await db
    .select()
    .from(rentals)
    .where(eq(rentals.id, rentalId))
    .limit(1);

  if (!rental) {
    return { success: false, error: "Rental not found" };
  }

  if (rental.status !== "PENDING") {
    return { success: false, error: "Rental is not pending" };
  }

  await db
    .update(rentals)
    .set({
      status: "REJECTED",
      agentId: session.user.id,
      updatedAt: new Date(),
    })
    .where(eq(rentals.id, rentalId));

  await db.insert(rentalEvents).values({
    rentalId,
    eventType: "REJECT",
    actorId: session.user.id,
    notes: parsed.data.reason,
  });

  revalidatePath("/");
  revalidatePath("/agent/requests");
  revalidatePath("/dashboard/rentals");

  return { success: true, data: { id: rentalId } };
}

// ── 5. Handover Rental ─────────────────────────────────

export async function handoverRental(
  rentalId: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const idParsed = idSchema.safeParse(rentalId);
  if (!idParsed.success) {
    return { success: false, error: "Invalid ID" };
  }

  const parsed = mileageWithNotesSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const session = await auth();
  if (
    !session ||
    (session.user.role !== "agent" && session.user.role !== "admin")
  ) {
    return { success: false, error: "Unauthorized" };
  }

  const [rental] = await db
    .select()
    .from(rentals)
    .where(eq(rentals.id, rentalId))
    .limit(1);

  if (!rental) {
    return { success: false, error: "Rental not found" };
  }

  if (rental.status !== "APPROVED") {
    return { success: false, error: "Rental is not approved" };
  }

  await db
    .update(rentals)
    .set({
      status: "ACTIVE",
      updatedAt: new Date(),
    })
    .where(eq(rentals.id, rentalId));

  await db.insert(rentalEvents).values({
    rentalId,
    eventType: "HANDOVER",
    actorId: session.user.id,
    mileageKm: parsed.data.mileageKm,
    notes: parsed.data.notes ?? null,
  });

  revalidatePath("/");
  revalidatePath("/agent/requests");
  revalidatePath("/agent/active");
  revalidatePath("/dashboard/rentals");

  return { success: true, data: { id: rentalId } };
}

// ── 6. Return Rental ───────────────────────────────────

export async function returnRental(
  rentalId: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const idParsed = idSchema.safeParse(rentalId);
  if (!idParsed.success) {
    return { success: false, error: "Invalid ID" };
  }

  const parsed = mileageWithNotesSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const session = await auth();
  if (
    !session ||
    (session.user.role !== "agent" && session.user.role !== "admin")
  ) {
    return { success: false, error: "Unauthorized" };
  }

  const [rental] = await db
    .select()
    .from(rentals)
    .where(eq(rentals.id, rentalId))
    .limit(1);

  if (!rental) {
    return { success: false, error: "Rental not found" };
  }

  if (rental.status !== "ACTIVE") {
    return { success: false, error: "Rental is not active" };
  }

  await db
    .update(rentals)
    .set({
      status: "CLOSED",
      updatedAt: new Date(),
    })
    .where(eq(rentals.id, rentalId));

  await db.insert(rentalEvents).values({
    rentalId,
    eventType: "RETURN",
    actorId: session.user.id,
    mileageKm: parsed.data.mileageKm,
    notes: parsed.data.notes ?? null,
  });

  // Update car mileage to the return reading
  await db
    .update(cars)
    .set({
      mileageKm: parsed.data.mileageKm,
      updatedAt: new Date(),
    })
    .where(eq(cars.id, rental.carId));

  revalidatePath("/");
  revalidatePath("/agent/active");
  revalidatePath("/agent/invoices");
  revalidatePath("/dashboard/rentals");
  revalidatePath("/admin/cars");

  return { success: true, data: { id: rentalId } };
}

// ── 7. Get Rental Details (for detail dialog) ─────────

export async function getRentalDetails(
  rentalId: string
): Promise<
  ActionResult<{
    events: RentalEventDTO[];
    agentContact: {
      name: string;
      email: string;
      phone: string | null;
    } | null;
    customerPhone: string | null;
  }>
> {
  const idParsed = idSchema.safeParse(rentalId);
  if (!idParsed.success) {
    return { success: false, error: "Invalid ID" };
  }

  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const rental = await getRentalById(rentalId);
  if (!rental) {
    return { success: false, error: "Rental not found" };
  }

  const events = await getRentalEvents(rentalId);

  let agentContact: {
    name: string;
    email: string;
    phone: string | null;
  } | null = null;
  if (rental.agentId) {
    const agent = await getUserById(rental.agentId);
    if (agent) {
      agentContact = {
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
      };
    }
  }

  let customerPhone: string | null = null;
  if (rental.userId) {
    const customer = await getUserById(rental.userId);
    if (customer) {
      customerPhone = customer.phone;
    }
  }

  return {
    success: true,
    data: { events, agentContact, customerPhone },
  };
}

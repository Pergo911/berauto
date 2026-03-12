"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { invoices, rentals, cars } from "@/db/schema";
import { auth } from "@/lib/auth";
import { idSchema } from "@/lib/validations/rentals";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function issueInvoice(
  rentalId: string
): Promise<ActionResult<{ id: string }>> {
  const parsed = idSchema.safeParse(rentalId);
  if (!parsed.success) {
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

  if (rental.status !== "CLOSED") {
    return { success: false, error: "Rental must be closed before invoicing" };
  }

  const [existingInvoice] = await db
    .select({ id: invoices.id })
    .from(invoices)
    .where(eq(invoices.rentalId, rentalId))
    .limit(1);

  if (existingInvoice) {
    return { success: false, error: "Invoice already exists for this rental" };
  }

  const [car] = await db
    .select({ dailyRate: cars.dailyRate })
    .from(cars)
    .where(eq(cars.id, rental.carId))
    .limit(1);

  if (!car) {
    return { success: false, error: "Car not found" };
  }

  const startDate = new Date(rental.startDate);
  const endDate = new Date(rental.endDate);
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const amount = (parseFloat(car.dailyRate) * days).toFixed(2);

  const [invoice] = await db
    .insert(invoices)
    .values({
      rentalId,
      amount,
      issuedBy: session.user.id,
      issuedAt: new Date(),
      pdfUrl: null,
    })
    .returning({ id: invoices.id });

  await db
    .update(rentals)
    .set({ status: "CLOSED_INVOICED", updatedAt: new Date() })
    .where(eq(rentals.id, rentalId));

  revalidatePath("/agent/invoices");
  revalidatePath("/agent/active");
  revalidatePath("/agent");
  revalidatePath("/dashboard/rentals");

  return { success: true, data: { id: invoice.id } };
}

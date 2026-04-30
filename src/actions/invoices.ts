"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { invoices, rentals } from "@/db/schema";
import { auth } from "@/lib/auth";
import { issueInvoiceSchema } from "@/lib/validations/invoices";
import { sendRentalEmail } from "@/lib/send-rental-email";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function issueInvoice(
  rentalId: string,
  customAmount: number
): Promise<ActionResult<{ id: string }>> {
  const parsed = issueInvoiceSchema.safeParse({
    rentalId,
    amount: customAmount,
  });
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

  const amount = parsed.data.amount.toFixed(2);

  const [invoice] = await db
    .insert(invoices)
    .values({
      rentalId,
      amount,
      issuedBy: session.user.id,
      issuedAt: new Date(),
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

  sendRentalEmail(rentalId, "INVOICE", { amount: parsed.data.amount }).catch(
    (err) => console.error("[issueInvoice] Failed to send email:", err)
  );

  return { success: true, data: { id: invoice.id } };
}

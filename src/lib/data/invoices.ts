import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import type { RentalStatus } from "@/types";
import { db } from "@/db";
import { cars, invoices, rentals, users } from "@/db/schema";
import type { InvoicePDFData } from "@/components/invoices/invoice-pdf";

// ── Table alias ────────────────────────────────────────

const issuerRef = alias(users, "issuerRef");

// ── DTOs ───────────────────────────────────────────────

export type InvoiceDTO = {
  id: string;
  rentalId: string;
  amount: number;
  issuedAt: Date;
  issuedBy: string;
  issuerName: string | null;
  rental: {
    startDate: Date;
    endDate: Date;
    status: RentalStatus;
    guestName: string | null;
    userId: string | null;
  };
  car: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
};

export type ClosedRentalWithoutInvoiceDTO = {
  id: string;
  carId: string;
  car: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    dailyRate: number;
  };
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  guestName: string | null;
  guestEmail: string | null;
  startDate: Date;
  endDate: Date;
  status: RentalStatus;
  createdAt: Date;
  /** Notes from the RETURN event, if any. */
  returnNotes: string | null;
};

// ── Queries ────────────────────────────────────────────

/** List invoices with rental, car, and issuer info. */
export async function getInvoices(filters?: {
  rentalId?: string;
  issuedBy?: string;
}): Promise<InvoiceDTO[]> {
  const conditions = [];

  if (filters?.rentalId)
    conditions.push(eq(invoices.rentalId, filters.rentalId));
  if (filters?.issuedBy)
    conditions.push(eq(invoices.issuedBy, filters.issuedBy));

  const rows = await db
    .select({
      invoice: invoices,
      rentalStartDate: rentals.startDate,
      rentalEndDate: rentals.endDate,
      rentalStatus: rentals.status,
      rentalGuestName: rentals.guestName,
      rentalUserId: rentals.userId,
      carMake: cars.make,
      carModel: cars.model,
      carYear: cars.year,
      carLicensePlate: cars.licensePlate,
      issuerName: issuerRef.name,
    })
    .from(invoices)
    .innerJoin(rentals, eq(invoices.rentalId, rentals.id))
    .innerJoin(cars, eq(rentals.carId, cars.id))
    .leftJoin(issuerRef, eq(invoices.issuedBy, issuerRef.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(invoices.issuedAt));

  return rows.map((r) => ({
    id: r.invoice.id,
    rentalId: r.invoice.rentalId,
    amount: Number(r.invoice.amount),
    issuedAt: r.invoice.issuedAt,
    issuedBy: r.invoice.issuedBy,
    issuerName: r.issuerName,
    rental: {
      startDate: r.rentalStartDate,
      endDate: r.rentalEndDate,
      status: r.rentalStatus,
      guestName: r.rentalGuestName,
      userId: r.rentalUserId,
    },
    car: {
      make: r.carMake,
      model: r.carModel,
      year: r.carYear,
      licensePlate: r.carLicensePlate,
    },
  }));
}

/** Get a single invoice by rental ID, or `null` if not found. */
export async function getInvoiceByRentalId(
  rentalId: string
): Promise<InvoiceDTO | null> {
  const results = await getInvoices({ rentalId });
  return results[0] ?? null;
}

/**
 * Get all CLOSED rentals that do not yet have an invoice.
 * Used by the agent invoicing page to show which rentals need billing.
 */
export async function getClosedRentalsWithoutInvoice(): Promise<
  ClosedRentalWithoutInvoiceDTO[]
> {
  const rows = await db
    .select({
      rental: rentals,
      carMake: cars.make,
      carModel: cars.model,
      carYear: cars.year,
      carLicensePlate: cars.licensePlate,
      carDailyRate: cars.dailyRate,
      invoiceId: invoices.id,
      userName: users.name,
      userEmail: users.email,
      returnNotes: sql<string | null>`(
        SELECT notes FROM rental_events
        WHERE rental_id = ${rentals.id}
          AND event_type = 'RETURN'
        LIMIT 1
      )`,
    })
    .from(rentals)
    .innerJoin(cars, eq(rentals.carId, cars.id))
    .leftJoin(invoices, eq(rentals.id, invoices.rentalId))
    .leftJoin(users, eq(rentals.userId, users.id))
    .where(and(eq(rentals.status, "CLOSED"), isNull(invoices.id)))
    .orderBy(desc(rentals.createdAt));

  return rows.map((r) => ({
    id: r.rental.id,
    carId: r.rental.carId,
    car: {
      make: r.carMake,
      model: r.carModel,
      year: r.carYear,
      licensePlate: r.carLicensePlate,
      dailyRate: Number(r.carDailyRate),
    },
    userId: r.rental.userId,
    userName: r.userName ?? null,
    userEmail: r.userEmail ?? null,
    guestName: r.rental.guestName,
    guestEmail: r.rental.guestEmail,
    startDate: r.rental.startDate,
    endDate: r.rental.endDate,
    status: r.rental.status,
    createdAt: r.rental.createdAt,
    returnNotes: r.returnNotes,
  }));
}

// ── PDF Data Query ─────────────────────────────────────

const customerRef = alias(users, "customerRef");
const pdfIssuerRef = alias(users, "pdfIssuerRef");

/**
 * Fetch all data required to render an invoice PDF.
 * Returns `null` if no invoice exists for the given rental ID.
 */
export async function getInvoicePDFData(
  rentalId: string
): Promise<InvoicePDFData | null> {
  const rows = await db
    .select({
      invoiceId: invoices.id,
      rentalId: invoices.rentalId,
      amount: invoices.amount,
      issuedAt: invoices.issuedAt,
      issuerName: pdfIssuerRef.name,
      startDate: rentals.startDate,
      endDate: rentals.endDate,
      userId: rentals.userId,
      guestName: rentals.guestName,
      guestEmail: rentals.guestEmail,
      carMake: cars.make,
      carModel: cars.model,
      carYear: cars.year,
      carLicensePlate: cars.licensePlate,
      carDailyRate: cars.dailyRate,
      customerName: customerRef.name,
      customerEmail: customerRef.email,
    })
    .from(invoices)
    .innerJoin(rentals, eq(invoices.rentalId, rentals.id))
    .innerJoin(cars, eq(rentals.carId, cars.id))
    .leftJoin(customerRef, eq(rentals.userId, customerRef.id))
    .leftJoin(pdfIssuerRef, eq(invoices.issuedBy, pdfIssuerRef.id))
    .where(eq(invoices.rentalId, rentalId))
    .limit(1);

  const r = rows[0];
  if (!r) return null;

  const start = new Date(r.startDate);
  const end = new Date(r.endDate);
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  const amount = Number(r.amount);

  const shortId = r.invoiceId.replace(/-/g, "").slice(0, 8).toUpperCase();
  const invoiceNumber = `INV-${new Date(r.issuedAt).getFullYear()}-${shortId}`;

  return {
    invoiceNumber,
    id: r.invoiceId,
    rentalId: r.rentalId,
    amount,
    issuedAt: r.issuedAt,
    issuerName: r.issuerName ?? null,
    customer: {
      name: r.customerName ?? r.guestName ?? "Unknown Customer",
      email: r.customerEmail ?? r.guestEmail ?? "",
    },
    rental: {
      startDate: start,
      endDate: end,
      days,
    },
    car: {
      make: r.carMake,
      model: r.carModel,
      year: r.carYear,
      licensePlate: r.carLicensePlate,
      dailyRate: Number(r.carDailyRate),
    },
  };
}

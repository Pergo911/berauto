import { resend } from "@/lib/resend";
import { env } from "@/lib/env";
import { getRentalById } from "@/lib/data/rentals";
import {
  renderRentalEmail,
  rentalEmailSubject,
  type RentalNotificationType,
} from "@/emails/rental-notifications";

export type { RentalNotificationType };

export interface RentalEmailExtras {
  notes?: string | null;
  mileageKm?: number | null;
  amount?: number | null;
}

function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * Fetches the rental, resolves customer email and name, then sends the
 * appropriate rental lifecycle email. Always fire-and-forget — never throws.
 */
export async function sendRentalEmail(
  rentalId: string,
  type: RentalNotificationType,
  extras: RentalEmailExtras = {}
): Promise<void> {
  const rental = await getRentalById(rentalId);
  if (!rental) {
    console.error(`[sendRentalEmail] Rental not found: ${rentalId}`);
    return;
  }

  const isRegisteredUser = rental.userId !== null;
  const customerEmail = rental.userEmail ?? rental.guestEmail;
  const customerName =
    rental.userName ??
    rental.guestName ??
    rental.userEmail ??
    rental.guestEmail ??
    "";

  if (!customerEmail) {
    console.warn(
      `[sendRentalEmail] No customer email for rental ${rentalId}, skipping ${type} notification`
    );
    return;
  }

  const locale = (rental.locale as "en" | "hu") ?? "hu";
  const appUrl = getAppUrl();

  const emailData = {
    customerName,
    rentalId,
    car: {
      year: rental.car.year,
      make: rental.car.make,
      model: rental.car.model,
      licensePlate: rental.car.licensePlate,
      dailyRate: rental.car.dailyRate,
    },
    startDate: rental.startDate,
    endDate: rental.endDate,
    locale,
    notes: extras.notes ?? null,
    mileageKm: extras.mileageKm ?? null,
    amount: extras.amount ?? null,
    isRegisteredUser,
    appUrl,
  };

  const subject = rentalEmailSubject(type, locale);
  const html = renderRentalEmail(type, emailData);

  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: [customerEmail],
    subject,
    html,
  });

  if (error) {
    console.error(
      `[sendRentalEmail] Resend error for rental ${rentalId} (${type}):`,
      error
    );
  }
}

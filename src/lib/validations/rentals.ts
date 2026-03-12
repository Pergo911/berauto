import { z } from "zod/v4";

export const rentalStatusEnum = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ACTIVE",
  "CLOSED",
  "CLOSED_INVOICED",
]);
export type RentalStatusEnum = z.infer<typeof rentalStatusEnum>;

export const createRentalSchema = z
  .object({
    carId: z.uuid("Invalid car ID"),
    startDate: z.iso.date("Invalid start date"),
    endDate: z.iso.date("Invalid end date"),
    // Guest fields (for non-registered users)
    guestName: z
      .string()
      .min(2)
      .max(255, "Guest name cannot exceed 255 characters")
      .optional(),
    guestEmail: z.email().optional(),
    guestPhone: z
      .string()
      .min(5)
      .max(30, "Phone number cannot exceed 30 characters")
      .optional(),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type CreateRentalInput = z.infer<typeof createRentalSchema>;

export const idSchema = z.uuid("Invalid ID");

export const rentalSearchSchema = z.object({
  status: z.union([rentalStatusEnum, z.array(rentalStatusEnum)]).optional(),
  sort: z.enum(["newest", "oldest"]).optional(),
});

export type RentalSearchInput = z.infer<typeof rentalSearchSchema>;

export const mileageSchema = z.object({
  mileageKm: z.coerce.number().int().positive("Mileage must be positive"),
});

export type MileageInput = z.infer<typeof mileageSchema>;

export const rejectReasonSchema = z.object({
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(1000, "Reason cannot exceed 1000 characters"),
});

export type RejectReasonInput = z.infer<typeof rejectReasonSchema>;

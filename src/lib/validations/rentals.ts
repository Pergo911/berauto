import { z } from "zod/v4";

export const createRentalSchema = z.object({
  carId: z.uuid("Invalid car ID"),
  startDate: z.iso.date("Invalid start date"),
  endDate: z.iso.date("Invalid end date"),
  // Guest fields (for non-registered users)
  guestName: z.string().min(2).optional(),
  guestEmail: z.email().optional(),
  guestPhone: z.string().min(5).optional(),
});

export type CreateRentalInput = z.infer<typeof createRentalSchema>;

export const idSchema = z.uuid("Invalid ID");

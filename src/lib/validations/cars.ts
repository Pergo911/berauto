import { z } from "zod/v4";

export const createCarSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(1, "License plate is required"),
  mileageKm: z.number().int().min(0).default(0),
  dailyRate: z.number().positive("Daily rate must be positive"),
  isAvailable: z.boolean().default(true),
});

export type CreateCarInput = z.infer<typeof createCarSchema>;

export const updateCarSchema = createCarSchema.partial();
export type UpdateCarInput = z.infer<typeof updateCarSchema>;

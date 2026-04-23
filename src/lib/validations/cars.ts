import { z } from "zod/v4";

export const carStatusEnum = z.enum([
  "AVAILABLE",
  "MAINTENANCE",
  "UNAVAILABLE",
]);
export type CarStatusEnum = z.infer<typeof carStatusEnum>;

export const createCarSchema = z.object({
  make: z
    .string()
    .min(1, "Make is required")
    .max(100, "Make cannot exceed 100 characters"),
  model: z
    .string()
    .min(1, "Model is required")
    .max(100, "Model cannot exceed 100 characters"),
  year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  licensePlate: z
    .string()
    .min(1, "License plate is required")
    .max(20, "License plate cannot exceed 20 characters"),
  mileageKm: z.coerce.number().int().min(0).default(0),
  dailyRate: z.coerce.number().positive("Daily rate must be positive"),
  status: carStatusEnum.default("AVAILABLE"),
  brandId: z.string().uuid().nullish(),
  imageUrl: z.string().url().nullish(),
});

export type CreateCarInput = z.infer<typeof createCarSchema>;

export const updateCarSchema = createCarSchema.partial();
export type UpdateCarInput = z.infer<typeof updateCarSchema>;

export const carSearchSchema = z.object({
  search: z.string().optional(),
  status: carStatusEnum.optional(),
  sort: z.enum(["price-asc", "price-desc", "year-desc", "year-asc"]).optional(),
});

export type CarSearchInput = z.infer<typeof carSearchSchema>;

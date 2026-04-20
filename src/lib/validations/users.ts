import { z } from "zod/v4";

export const userSearchSchema = z.object({
  q: z.string().min(2, "Search requires at least 2 characters"),
});

export type UserSearchInput = z.infer<typeof userSearchSchema>;

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name cannot exceed 255 characters")
    .optional(),
  email: z.email("Invalid email address").optional(),
  phone: z
    .string()
    .max(50, "Phone cannot exceed 50 characters")
    .optional()
    .nullable(),
  address: z.string().optional().nullable(),
  role: z.enum(["user", "agent", "admin"]).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

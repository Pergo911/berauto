import { z } from "zod/v4";

export const userSearchSchema = z.object({
  q: z.string().min(2, "Search requires at least 2 characters"),
});

export type UserSearchInput = z.infer<typeof userSearchSchema>;

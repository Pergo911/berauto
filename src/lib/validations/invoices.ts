import { z } from "zod/v4";

export const invoiceSearchSchema = z.object({
  sort: z.enum(["newest", "oldest"]).optional(),
});

export type InvoiceSearchInput = z.infer<typeof invoiceSearchSchema>;

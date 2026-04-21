import { z } from "zod/v4";

export const invoiceSearchSchema = z.object({
  sort: z.enum(["newest", "oldest"]).optional(),
});

export type InvoiceSearchInput = z.infer<typeof invoiceSearchSchema>;

export const issueInvoiceSchema = z.object({
  rentalId: z.string().uuid(),
  amount: z.number().positive().finite(),
});

export type IssueInvoiceInput = z.infer<typeof issueInvoiceSchema>;

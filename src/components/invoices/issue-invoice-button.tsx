"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { toast } from "sonner";

import { issueInvoice } from "@/actions/invoices";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function IssueInvoiceButton({
  rentalId,
  computedAmount,
}: {
  rentalId: string;
  computedAmount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleIssue() {
    startTransition(async () => {
      const result = await issueInvoice(rentalId);
      if (result.success) {
        toast.success("Invoice issued");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-3 justify-between">
      <span className="text-sm font-medium">
        Amount: {formatCurrency(computedAmount)}
      </span>
      <Button size="sm" onClick={handleIssue} disabled={isPending}>
        <FileText className="size-3.5" />
        {isPending ? "Issuing…" : "Issue Invoice"}
      </Button>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleIssue() {
    setMessage(null);
    startTransition(async () => {
      const result = await issueInvoice(rentalId);
      if (result.success) {
        setMessage({ type: "success", text: "Invoice issued" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
          Amount: {formatCurrency(computedAmount)}
        </span>
        <Button size="sm" onClick={handleIssue} disabled={isPending}>
          {isPending ? "Issuing…" : "Issue Invoice"}
        </Button>
      </div>

      {message && (
        <p
          className={
            message.type === "success"
              ? "text-sm text-green-600 dark:text-green-400"
              : "text-sm text-destructive"
          }
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

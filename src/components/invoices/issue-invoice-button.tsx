"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { toast } from "sonner";

import { issueInvoice } from "@/actions/invoices";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function IssueInvoiceButton({
  rentalId,
  computedAmount,
}: {
  rentalId: string;
  computedAmount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rawAmount, setRawAmount] = useState(String(computedAmount));

  const parsedAmount = parseFloat(rawAmount);
  const isValid = !isNaN(parsedAmount) && parsedAmount > 0;
  const isCustom = isValid && parsedAmount !== computedAmount;

  function handleIssue() {
    if (!isValid) return;
    startTransition(async () => {
      const result = await issueInvoice(rentalId, parsedAmount);
      if (result.success) {
        toast.success("Invoice issued");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={`amount-${rentalId}`} className="text-sm font-medium">
            Amount (HUF)
          </Label>
          {isCustom && (
            <span className="text-xs text-muted-foreground">
              Computed: {formatCurrency(computedAmount)}
            </span>
          )}
        </div>
        <Input
          id={`amount-${rentalId}`}
          type="number"
          min="0.01"
          step="0.01"
          value={rawAmount}
          onChange={(e) => setRawAmount(e.target.value)}
          className="h-8 text-sm"
          disabled={isPending}
        />
      </div>
      <Button
        size="sm"
        className="w-full"
        onClick={handleIssue}
        disabled={isPending || !isValid}
      >
        <FileText className="size-3.5" />
        {isPending ? "Issuing…" : "Issue Invoice"}
      </Button>
    </div>
  );
}

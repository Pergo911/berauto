"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { approveRental, rejectRental } from "@/actions/rentals";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ApproveRejectActions({ rentalId }: { rentalId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleApprove() {
    setMessage(null);
    startTransition(async () => {
      const result = await approveRental(rentalId, true);
      if (result.success) {
        setMessage({ type: "success", text: "Rental approved" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  function handleReject() {
    if (!reason.trim()) {
      setMessage({ type: "error", text: "Please provide a rejection reason" });
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await rejectRental(rentalId, { reason: reason.trim() });
      if (result.success) {
        setMessage({ type: "success", text: "Rental rejected" });
        setShowRejectForm(false);
        setReason("");
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button size="sm" onClick={handleApprove} disabled={isPending}>
          {isPending ? "Processing…" : "Approve"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setShowRejectForm((prev) => !prev)}
          disabled={isPending}
        >
          Reject
        </Button>
      </div>

      {showRejectForm && (
        <div className="space-y-2">
          <Textarea
            placeholder="Reason for rejection…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[60px]"
            disabled={isPending}
          />
          <Button
            size="sm"
            variant="destructive"
            onClick={handleReject}
            disabled={isPending}
          >
            {isPending ? "Rejecting…" : "Confirm Reject"}
          </Button>
        </div>
      )}

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

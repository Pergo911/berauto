"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

import { approveRental, rejectRental } from "@/actions/rentals";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ActionFeedback,
  type ActionMessage,
} from "@/components/shared/action-feedback";

export function ApproveRejectActions({ rentalId }: { rentalId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<ActionMessage | null>(null);

  function handleApprove() {
    setMessage(null);
    startTransition(async () => {
      const result = await approveRental(rentalId, true);
      if (result.success) {
        setMessage({ type: "success", text: "Rental approved" });
        setApproveOpen(false);
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error });
        setApproveOpen(false);
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
        setRejectOpen(false);
        setReason("");
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error });
        setRejectOpen(false);
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => setApproveOpen(true)}
          disabled={isPending}
        >
          <Check className="size-4" />
          {isPending ? "Processing…" : "Approve"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setRejectOpen(true)}
          disabled={isPending}
        >
          <X className="size-4" />
          Reject
        </Button>
      </div>

      {/* Approve Confirmation */}
      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Rental Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this rental request? Any
              conflicting pending requests for the same car and date range will
              be automatically rejected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={isPending}>
              {isPending ? "Approving…" : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation */}
      <AlertDialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) setReason("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Rental Request</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this rental request. This
              will be recorded in the rental history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for rejection…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[80px]"
            disabled={isPending}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleReject}
              disabled={isPending || !reason.trim()}
            >
              {isPending ? "Rejecting…" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ActionFeedback message={message} />
    </div>
  );
}

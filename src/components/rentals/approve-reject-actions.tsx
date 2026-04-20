"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
  approveRental,
  getApprovalConflicts,
  rejectRental,
} from "@/actions/rentals";
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
import { formatDate } from "@/lib/utils";

const DEFAULT_CONFLICT_NOTE =
  "Sorry, this request was automatically rejected because another rental was approved for the same dates.";

type ConflictItem = {
  id: string;
  startDate: Date;
  endDate: Date;
  renterName: string | null;
};

export function ApproveRejectActions({ rentalId }: { rentalId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [reason, setReason] = useState("");
  const [conflicts, setConflicts] = useState<ConflictItem[] | null>(null);
  const [conflictsLoading, setConflictsLoading] = useState(false);
  // Per-conflict rejection notes keyed by conflict rental ID
  const [conflictNotes, setConflictNotes] = useState<Record<string, string>>(
    {}
  );

  // Open the approve dialog and immediately begin fetching conflicts.
  async function handleApproveOpen() {
    setConflictsLoading(true);
    setApproveOpen(true);
    const result = await getApprovalConflicts(rentalId);
    const fetchedConflicts = result.success ? result.data.conflicts : [];
    setConflicts(fetchedConflicts);
    // Pre-populate conflict notes with the default message
    const initial: Record<string, string> = {};
    for (const c of fetchedConflicts) {
      initial[c.id] = DEFAULT_CONFLICT_NOTE;
    }
    setConflictNotes(initial);
    setConflictsLoading(false);
  }

  function handleApprove() {
    startTransition(async () => {
      const result = await approveRental(rentalId, {
        autoRejectConflicts: true,
        notes: approveNotes.trim() || undefined,
        conflictNotes,
      });
      if (result.success) {
        toast.success("Rental approved");
        setApproveOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
        setApproveOpen(false);
      }
    });
  }

  function handleReject() {
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    startTransition(async () => {
      const result = await rejectRental(rentalId, { reason: reason.trim() });
      if (result.success) {
        toast.success("Rental rejected");
        setRejectOpen(false);
        setReason("");
        router.refresh();
      } else {
        toast.error(result.error);
        setRejectOpen(false);
      }
    });
  }

  const conflictCount = conflicts?.length ?? 0;

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={handleApproveOpen}
        disabled={isPending || conflictsLoading}
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

      {/* Approve Confirmation */}
      <AlertDialog
        open={approveOpen}
        onOpenChange={(open) => {
          setApproveOpen(open);
          if (!open) {
            setConflicts(null);
            setConflictsLoading(false);
            setApproveNotes("");
            setConflictNotes({});
          }
        }}
      >
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Rental Request</AlertDialogTitle>
            <AlertDialogDescription>
              {conflictsLoading
                ? "Checking for conflicting requests…"
                : conflictCount > 0
                  ? `Approving this request will automatically reject ${conflictCount} conflicting pending request${conflictCount > 1 ? "s" : ""}.`
                  : "Are you sure you want to approve this rental request?"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {conflictsLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!conflictsLoading && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Reason{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Textarea
                  placeholder="Add a note for the approval…"
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  className="min-h-[80px]"
                  disabled={isPending}
                />
              </div>

              {conflictCount > 0 && conflicts && (
                <div className="space-y-3 rounded-md border border-destructive/30 bg-destructive/10 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertTriangle className="size-4" />
                    Requests that will be rejected
                  </div>
                  <ul className="space-y-3">
                    {conflicts.map((conflict) => (
                      <li key={conflict.id} className="space-y-1.5">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {conflict.renterName ?? "Unknown"}
                          </span>
                          {" · "}
                          {formatDate(conflict.startDate)} –{" "}
                          {formatDate(conflict.endDate)}
                        </p>
                        <Textarea
                          placeholder="Rejection message…"
                          value={conflictNotes[conflict.id] ?? ""}
                          onChange={(e) =>
                            setConflictNotes((prev) => ({
                              ...prev,
                              [conflict.id]: e.target.value,
                            }))
                          }
                          className="min-h-[60px] text-xs"
                          disabled={isPending}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending || conflictsLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isPending || conflictsLoading}
            >
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
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
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

type ConflictItem = {
  id: string;
  startDate: Date;
  endDate: Date;
  renterName: string | null;
};

export function ApproveRejectActions({ rentalId }: { rentalId: string }) {
  const t = useTranslations("ApproveRejectActions");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
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
      initial[c.id] = t("defaultConflictNote");
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
        toast.success(t("toastApproved"));
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
      toast.error(t("toastNeedReason"));
      return;
    }
    startTransition(async () => {
      const result = await rejectRental(rentalId, { reason: reason.trim() });
      if (result.success) {
        toast.success(t("toastRejected"));
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
        {isPending ? t("processing") : t("approve")}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => setRejectOpen(true)}
        disabled={isPending}
      >
        <X className="size-4" />
        {t("reject")}
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
            <AlertDialogTitle>{t("approveTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {conflictsLoading
                ? t("checkingConflicts")
                : conflictCount > 0
                  ? t("approveDescConflicts", { count: conflictCount })
                  : t("approveDescNoConflict")}
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
                  {t("reasonLabel")}{" "}
                  <span className="font-normal text-muted-foreground">
                    {t("reasonOptional")}
                  </span>
                </label>
                <Textarea
                  placeholder={t("approveNotePlaceholder")}
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
                    {t("conflictsSectionTitle")}
                  </div>
                  <ul className="space-y-3">
                    {conflicts.map((conflict) => (
                      <li key={conflict.id} className="space-y-1.5">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {conflict.renterName ?? tCommon("unknown")}
                          </span>
                          {" · "}
                          {formatDate(conflict.startDate, locale)} –{" "}
                          {formatDate(conflict.endDate, locale)}
                        </p>
                        <Textarea
                          placeholder={t("rejectionMessagePlaceholder")}
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
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isPending || conflictsLoading}
            >
              {isPending ? t("approving") : t("approve")}
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
            <AlertDialogTitle>{t("rejectTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("rejectDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder={t("rejectNotePlaceholder")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[80px]"
            disabled={isPending}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleReject}
              disabled={isPending || !reason.trim()}
            >
              {isPending ? t("rejecting") : t("reject")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

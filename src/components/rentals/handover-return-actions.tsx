"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Gauge, KeyRound, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { handoverRental, returnRental } from "@/actions/rentals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function HandoverReturnActions({
  rentalId,
  type,
  lastMileageKm,
}: {
  rentalId: string;
  type: "handover" | "return";
  lastMileageKm?: number | null;
}) {
  const router = useRouter();
  const t = useTranslations("HandoverReturnActions");
  const [isPending, startTransition] = useTransition();
  const [mileage, setMileage] = useState("");
  const [note, setNote] = useState("");

  const isHandover = type === "handover";
  const label = t(isHandover ? "recordHandover" : "recordReturn");
  const action = isHandover ? handoverRental : returnRental;
  const Icon = isHandover ? KeyRound : RotateCcw;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const mileageKm = Number(mileage);
    if (!mileage || isNaN(mileageKm) || mileageKm < 0) {
      toast.error(t("validMileageError"));
      return;
    }

    startTransition(async () => {
      const result = await action(rentalId, {
        mileageKm,
        notes: note.trim() || undefined,
      });
      if (result.success) {
        toast.success(t(isHandover ? "toastHandover" : "toastReturn"));
        setMileage("");
        setNote("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label
            htmlFor={`mileage-${rentalId}`}
            className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground"
          >
            <Gauge className="size-3.5" />
            {t("mileageLabel")}
          </label>
          {lastMileageKm != null && (
            <p className="mb-2 text-xs text-muted-foreground">
              {t("lastRecorded")}{" "}
              <span className="font-medium text-foreground">
                {lastMileageKm.toLocaleString()} km
              </span>
            </p>
          )}
          <Input
            id={`mileage-${rentalId}`}
            type="number"
            min="0"
            placeholder="e.g. 45000"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            disabled={isPending}
          />
        </div>
        <Button size="sm" type="submit" disabled={isPending}>
          <Icon className="size-3.5" />
          {isPending ? t("saving") : label}
        </Button>
      </div>

      <div>
        <label
          htmlFor={`note-${rentalId}`}
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          {t("noteLabel")}{" "}
          <span className="font-normal">{t("noteOptional")}</span>
        </label>
        <Textarea
          id={`note-${rentalId}`}
          placeholder={t("observationsPlaceholder")}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[60px] resize-none text-sm"
          disabled={isPending}
        />
      </div>
    </form>
  );
}

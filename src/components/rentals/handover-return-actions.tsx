"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, RotateCcw } from "lucide-react";

import { handoverRental, returnRental } from "@/actions/rentals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ActionFeedback,
  type ActionMessage,
} from "@/components/shared/action-feedback";

export function HandoverReturnActions({
  rentalId,
  type,
}: {
  rentalId: string;
  type: "handover" | "return";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mileage, setMileage] = useState("");
  const [message, setMessage] = useState<ActionMessage | null>(null);

  const isHandover = type === "handover";
  const label = isHandover ? "Record Handover" : "Record Return";
  const action = isHandover ? handoverRental : returnRental;
  const Icon = isHandover ? KeyRound : RotateCcw;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const mileageKm = Number(mileage);
    if (!mileage || isNaN(mileageKm) || mileageKm < 0) {
      setMessage({ type: "error", text: "Please enter a valid mileage" });
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const result = await action(rentalId, { mileageKm });
      if (result.success) {
        setMessage({
          type: "success",
          text: isHandover ? "Handover recorded" : "Return recorded",
        });
        setMileage("");
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label
            htmlFor={`mileage-${rentalId}`}
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            Mileage (km)
          </label>
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
          {isPending ? "Saving…" : label}
        </Button>
      </div>

      <ActionFeedback message={message} />
    </form>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Maximize2, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type NoteDisplayProps = {
  notes: string | null;
  label?: string;
};

export function NoteDisplay({ notes, label }: NoteDisplayProps) {
  const t = useTranslations("NoteDisplay");
  const resolvedLabel = label ?? t("defaultLabel");
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="size-3" />
            {resolvedLabel}
          </p>
          {notes && (
            <Button
              variant="ghost"
              size="icon"
              className="size-5 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(true)}
              aria-label={`Expand ${resolvedLabel}`}
            >
              <Maximize2 className="size-3" />
            </Button>
          )}
        </div>
        <div className="h-16 overflow-y-auto rounded-md border bg-muted/40 px-2.5 py-2 text-xs text-muted-foreground">
          {notes ? (
            <p className="whitespace-pre-wrap">{notes}</p>
          ) : (
            <p className="italic">{t("noNotes")}</p>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MessageSquare className="size-3" />
              {resolvedLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto rounded-md border bg-muted/40 px-2.5 py-2 text-xs text-muted-foreground">
            <p className="whitespace-pre-wrap">{notes}</p>
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </>
  );
}

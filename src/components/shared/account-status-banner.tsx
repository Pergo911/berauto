"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type BannerVariant = "warning" | "info" | "error";

interface AccountStatusBannerProps {
  message: string;
  actionLabel?: string;
  onAction?: () => Promise<void>;
  variant?: BannerVariant;
  dismissible?: boolean;
}

const variantStyles: Record<BannerVariant, string> = {
  warning:
    "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200",
  info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200",
  error:
    "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200",
};

const actionVariantStyles: Record<BannerVariant, string> = {
  warning:
    "border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/30",
  info: "border-blue-300 text-blue-900 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-900/30",
  error:
    "border-red-300 text-red-900 hover:bg-red-100 dark:border-red-700 dark:text-red-200 dark:hover:bg-red-900/30",
};

export function AccountStatusBanner({
  message,
  actionLabel,
  onAction,
  variant = "warning",
  dismissible = true,
}: AccountStatusBannerProps) {
  const ENTER_DELAY_MS = 1000;
  const EXIT_ANIMATION_MS = 250;

  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), ENTER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (dismissed) return null;

  async function handleAction() {
    if (!onAction || pending || done) return;
    setPending(true);
    try {
      await onAction();
      setDone(true);
    } finally {
      setPending(false);
    }
  }

  function handleDismiss() {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => {
      setDismissed(true);
    }, EXIT_ANIMATION_MS);
  }

  return (
    <div
      role="status"
      className={cn(
        "fixed top-20 left-1/2 z-40 -translate-x-1/2",
        "w-[calc(100vw-2rem)] max-w-xl",
        "rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm",
        "transition-all ease-out",
        !visible || isClosing
          ? "-translate-y-2 opacity-0 duration-200"
          : "translate-y-0 opacity-100 duration-500",
        variantStyles[variant]
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm">{message}</p>

        <div className="flex shrink-0 items-center gap-2">
          {actionLabel && onAction && !done && (
            <Button
              size="sm"
              variant="outline"
              className={cn("h-7 text-xs", actionVariantStyles[variant])}
              onClick={handleAction}
              disabled={pending}
            >
              {pending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              {actionLabel}
            </Button>
          )}

          {dismissible && (
            <button
              aria-label="Dismiss"
              onClick={handleDismiss}
              className="rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

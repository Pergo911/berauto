"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Shield,
  User,
  XCircle,
} from "lucide-react";

import type { RentalDTO, RentalEventDTO } from "@/lib/data/rentals";
import { formatDate, formatDateTime, formatCurrency, cn } from "@/lib/utils";
import { getRentalDetails } from "@/actions/rentals";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RentalStatusBadge } from "@/components/rentals/rental-status-badge";

// ── Types ──────────────────────────────────────────────

type RentalDetailDialogProps = {
  rental: RentalDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "user" = dashboard view, "agent" = agent/admin view */
  variant: "user" | "agent";
};

type DetailData = {
  events: RentalEventDTO[];
  agentContact: {
    name: string;
    email: string;
    phone: string | null;
  } | null;
  customerPhone: string | null;
  invoice: {
    id: string;
    amount: number;
    issuedAt: Date;
  } | null;
};

// ── Event type config ──────────────────────────────────

const EVENT_TYPE_CONFIG: Record<
  string,
  {
    label: string;
    icon: typeof CheckCircle2;
    className: string;
  }
> = {
  REQUEST: {
    label: "Request",
    icon: MessageSquare,
    className:
      "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  APPROVE: {
    label: "Approved",
    icon: CheckCircle2,
    className:
      "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400",
  },
  REJECT: {
    label: "Rejected",
    icon: XCircle,
    className:
      "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400",
  },
  HANDOVER: {
    label: "Handover",
    icon: Car,
    className:
      "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  RETURN: {
    label: "Return",
    icon: Car,
    className:
      "border-purple-500/50 bg-purple-500/10 text-purple-700 dark:text-purple-400",
  },
};

// ── Helpers ────────────────────────────────────────────

function calculateDays(start: Date, end: Date): number {
  return Math.ceil(
    (new Date(end).getTime() - new Date(start).getTime()) / 86400000
  );
}

function shouldShowNotes(
  eventType: string,
  variant: "user" | "agent"
): boolean {
  if (variant === "agent") return true;
  return ["REQUEST", "APPROVE", "REJECT"].includes(eventType);
}

// ── Sub-components ─────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon?: typeof User;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-2 text-sm", className)}>
      {Icon && (
        <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      )}
      <span className="shrink-0 text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ContactSection({
  title,
  name,
  email,
  phone,
}: {
  title: string;
  name: string;
  email: string;
  phone: string | null;
}) {
  return (
    <div className="space-y-2">
      <h4 className="flex items-center gap-1.5 text-sm font-semibold">
        <Shield className="size-3.5 text-muted-foreground" />
        {title}
      </h4>
      <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
        <DetailRow icon={User} label="Name" value={name} />
        <DetailRow icon={Mail} label="Email" value={email} />
        <DetailRow
          icon={Phone}
          label="Phone"
          value={phone ?? "Not provided"}
        />
      </div>
    </div>
  );
}

function EventItem({
  event,
  variant,
}: {
  event: RentalEventDTO;
  variant: "user" | "agent";
}) {
  const config = EVENT_TYPE_CONFIG[event.eventType] ?? EVENT_TYPE_CONFIG.REQUEST;
  const Icon = config.icon;
  const showNotes = shouldShowNotes(event.eventType, variant);

  return (
    <div className="relative flex gap-3 pb-4 last:pb-0">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border",
            config.className
          )}
        >
          <Icon className="size-3.5" />
        </div>
        <div className="mt-1 w-px flex-1 bg-border last:hidden" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", config.className)}>
            {config.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDateTime(event.timestamp)}
          </span>
        </div>
        {event.actorName && (
          <p className="text-xs text-muted-foreground">
            by {event.actorName}
          </p>
        )}
        {event.mileageKm != null && (
          <p className="text-xs text-muted-foreground">
            Mileage: {event.mileageKm.toLocaleString()} km
          </p>
        )}
        {showNotes && event.notes && (
          <div className="mt-1.5 rounded-md border bg-muted/40 px-2.5 py-2 text-xs text-muted-foreground">
            <p className="whitespace-pre-wrap">{event.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────

export function RentalDetailDialog({
  rental,
  open,
  onOpenChange,
  variant,
}: RentalDetailDialogProps) {
  const [detailsState, setDetailsState] = useState<{
    rentalId: string;
    data: DetailData;
  } | null>(null);
  const details = detailsState?.rentalId === rental.id ? detailsState.data : null;
  const loading = open && detailsState?.rentalId !== rental.id;

  useEffect(() => {
    if (!open) return;

    let active = true;
    getRentalDetails(rental.id).then((result) => {
      if (active && result.success) {
        setDetailsState({ rentalId: rental.id, data: result.data });
      }
    });
    return () => {
      active = false;
    };
  }, [open, rental.id]);

  const days = calculateDays(rental.startDate, rental.endDate);
  const estimatedCost = rental.car.dailyRate * days;

  const customerName = rental.userName ?? rental.guestName ?? "Unknown";
  const customerEmail = rental.userEmail ?? rental.guestEmail ?? "—";
  const customerPhone =
    details?.customerPhone ?? rental.guestPhone ?? null;
  const isGuest = !!rental.guestName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="flex items-center gap-2">
              <Car className="size-5 text-muted-foreground" />
              {rental.car.make} {rental.car.model} ({rental.car.year})
            </DialogTitle>
            <RentalStatusBadge status={rental.status} />
          </div>
          <DialogDescription>{rental.car.licensePlate}</DialogDescription>
        </DialogHeader>

        {/* Rental Details */}
        <div className="space-y-1">
          <h4 className="flex items-center gap-1.5 text-sm font-semibold">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            Rental Details
          </h4>
          <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
            <div>
              <p className="text-xs text-muted-foreground">Start Date</p>
              <p className="text-sm font-medium">
                {formatDate(rental.startDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">End Date</p>
              <p className="text-sm font-medium">
                {formatDate(rental.endDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium">
                {days} day{days !== 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estimated Cost</p>
              <p className="text-sm font-semibold text-primary">
                {formatCurrency(estimatedCost)}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Customer Info (agent variant only) */}
        {variant === "agent" && (
          <>
            <div className="space-y-2">
              <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                <User className="size-3.5 text-muted-foreground" />
                Customer Info
                {isGuest && (
                  <Badge
                    variant="outline"
                    className="border-amber-500/50 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-400"
                  >
                    Guest
                  </Badge>
                )}
              </h4>
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                <DetailRow icon={User} label="Name" value={customerName} />
                <DetailRow icon={Mail} label="Email" value={customerEmail} />
                <DetailRow
                  icon={Phone}
                  label="Phone"
                  value={customerPhone ?? "Not provided"}
                />
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Agent Contact */}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : details?.agentContact ? (
          <>
            <ContactSection
              title={
                variant === "user"
                  ? "Your assigned agent"
                  : "Current assigned agent"
              }
              name={details.agentContact.name}
              email={details.agentContact.email}
              phone={details.agentContact.phone}
            />
            <Separator />
          </>
        ) : !loading && !details?.agentContact ? (
          <>
            <div className="space-y-2">
              <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                <Shield className="size-3.5 text-muted-foreground" />
                {variant === "user"
                  ? "Your assigned agent"
                  : "Current assigned agent"}
              </h4>
              <p className="text-sm text-muted-foreground italic">
                No agent assigned yet.
              </p>
            </div>
            <Separator />
          </>
        ) : null}

        {/* Invoice Section */}
        {rental.status === "CLOSED_INVOICED" && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                <FileText className="size-3.5 text-muted-foreground" />
                Invoice
              </h4>
              {loading ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Loading invoice…
                  </span>
                </div>
              ) : details?.invoice ? (
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {formatCurrency(details.invoice.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Issued {formatDate(details.invoice.issuedAt)}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={`/api/invoices/${rental.id}/pdf`}
                      download
                      className="flex items-center gap-1.5"
                    >
                      <Download className="size-3.5" />
                      Download PDF
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  Invoice data unavailable.
                </p>
              )}
            </div>
          </>
        )}

        {/* Status History */}
        <div className="space-y-3">
          <h4 className="flex items-center gap-1.5 text-sm font-semibold">
            <Clock className="size-3.5 text-muted-foreground" />
            Status History
          </h4>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : details?.events && details.events.length > 0 ? (
            <div className="max-h-64 overflow-y-auto pr-1">
              {[...details.events].reverse().map((event) => (
                <EventItem key={event.id} event={event} variant={variant} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No events recorded.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Icon shown in table rows on hover to indicate clickability */
export function DetailHoverIcon() {
  return (
    <span className="flex items-center justify-end opacity-0 transition-opacity group-hover/row:opacity-100">
      <Eye className="size-4 text-muted-foreground" />
    </span>
  );
}

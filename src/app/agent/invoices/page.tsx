import { CalendarDays, Car, Receipt, User } from "lucide-react";

import {
  getInvoices,
  getClosedRentalsWithoutInvoice,
} from "@/lib/data/invoices";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { BackLink } from "@/components/shared/back-link";
import { IssueInvoiceButton } from "@/components/invoices/issue-invoice-button";
import { InvoicesTable } from "@/components/invoices/invoices-table";
import { NoteDisplay } from "@/components/rentals/note-display";

export default async function AgentInvoicesPage() {
  const [uninvoiced, issuedInvoices] = await Promise.all([
    getClosedRentalsWithoutInvoice(),
    getInvoices(),
  ]);

  return (
    <div className="space-y-10">
      <BackLink href="/agent" label="Back to Dashboard" />
      <PageHeader title="Invoices" />

      {/* Awaiting Invoice section */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          <Receipt className="mr-2 inline-block size-5" />
          Awaiting Invoice
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({uninvoiced.length})
          </span>
        </h2>

        {uninvoiced.length === 0 ? (
          <EmptyState
            variant="plain"
            message="All closed rentals have been invoiced"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uninvoiced.map((rental) => {
              const days = Math.ceil(
                (new Date(rental.endDate).getTime() -
                  new Date(rental.startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              const computedAmount = rental.car.dailyRate * days;

              return (
                <Card
                  key={rental.id}
                  className="border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_50%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,253,250,0.95))] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_50%),linear-gradient(135deg,rgba(15,23,42,0.97),rgba(17,24,39,0.95))]"
                >
                  <CardHeader>
                    <CardTitle className="text-base">
                      <Car className="mr-1.5 inline-block size-4 text-muted-foreground" />
                      {rental.car.make} {rental.car.model} ({rental.car.year})
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {rental.car.licensePlate}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm">
                      <p className="flex flex-wrap items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        {rental.guestName ? (
                          <>
                            {rental.guestName}
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                              Guest
                            </span>
                          </>
                        ) : (
                          (rental.userName ?? "—")
                        )}
                      </p>
                      {(rental.guestEmail ?? rental.userEmail) && (
                        <p className="text-xs text-muted-foreground">
                          {rental.guestEmail ?? rental.userEmail}
                        </p>
                      )}
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="size-3" />
                          Start
                        </p>
                        <p className="font-medium">
                          {formatDate(rental.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="size-3" />
                          End
                        </p>
                        <p className="font-medium">
                          {formatDate(rental.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">
                        {days} day{days !== 1 ? "s" : ""} ×{" "}
                        {formatCurrency(rental.car.dailyRate)}/day
                      </p>
                    </div>

                    <Separator />

                    <NoteDisplay
                      notes={rental.returnNotes}
                      label="Return Notes"
                    />

                    <Separator />

                    <IssueInvoiceButton
                      rentalId={rental.id}
                      computedAmount={computedAmount}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Issued Invoices section */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          <Receipt className="mr-2 inline-block size-5" />
          Issued Invoices
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({issuedInvoices.length})
          </span>
        </h2>

        <InvoicesTable invoices={issuedInvoices} />
      </section>
    </div>
  );
}

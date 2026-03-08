import {
  getInvoices,
  getClosedRentalsWithoutInvoice,
} from "@/lib/data/invoices";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IssueInvoiceButton } from "@/components/invoices/issue-invoice-button";

export default async function AgentInvoicesPage() {
  const [uninvoiced, issuedInvoices] = await Promise.all([
    getClosedRentalsWithoutInvoice(),
    getInvoices(),
  ]);

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Invoices</h1>

      {/* Awaiting Invoice section */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Awaiting Invoice
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({uninvoiced.length})
          </span>
        </h2>

        {uninvoiced.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                All closed rentals have been invoiced
              </p>
            </CardContent>
          </Card>
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
                <Card key={rental.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {rental.car.make} {rental.car.model} ({rental.car.year})
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {rental.car.licensePlate}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Customer:</span>{" "}
                        {rental.guestName ?? "Registered user"}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Start</p>
                        <p className="font-medium">
                          {formatDate(rental.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">End</p>
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
          Issued Invoices
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({issuedInvoices.length})
          </span>
        </h2>

        {issuedInvoices.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No invoices issued yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Car</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead>Issued By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issuedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        {invoice.car.make} {invoice.car.model} (
                        {invoice.car.year})
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell>{formatDate(invoice.issuedAt)}</TableCell>
                      <TableCell>{invoice.issuerName ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

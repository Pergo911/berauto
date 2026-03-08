import type { RentalDTO } from "@/lib/data/rentals";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RentalStatusBadge } from "@/components/rentals/rental-status-badge";

type RentalTableProps = {
  rentals: RentalDTO[];
  showUser?: boolean;
};

export function RentalTable({ rentals, showUser = false }: RentalTableProps) {
  if (rentals.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        No rentals found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Car</TableHead>
            {showUser && <TableHead>Customer</TableHead>}
            <TableHead>Dates</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rentals.map((rental) => (
            <TableRow key={rental.id}>
              <TableCell className="font-medium">
                {rental.car.make} {rental.car.model}
              </TableCell>
              {showUser && (
                <TableCell>
                  {rental.userName ?? rental.guestName ?? "Unknown"}
                </TableCell>
              )}
              <TableCell>
                {formatDate(rental.startDate)} &ndash;{" "}
                {formatDate(rental.endDate)}
              </TableCell>
              <TableCell>
                <RentalStatusBadge status={rental.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(rental.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

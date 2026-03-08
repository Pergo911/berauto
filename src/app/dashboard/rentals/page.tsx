import { redirect } from "next/navigation";

import type { RentalStatus } from "@/types";
import { RENTAL_STATUS } from "@/types";
import { auth } from "@/lib/auth";
import { getRentals } from "@/lib/data/rentals";
import { PageHeader } from "@/components/shared/page-header";
import { RentalTable } from "@/components/rentals/rental-table";

type SearchParams = Promise<{ status?: string }>;

export default async function MyRentalsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { status } = await searchParams;

  const validStatuses = Object.values(RENTAL_STATUS) as string[];
  const statusFilter =
    status && validStatuses.includes(status)
      ? (status as RentalStatus)
      : undefined;

  const rentals = await getRentals({
    userId: session.user.id,
    status: statusFilter,
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="My Rentals" />

        <div className="flex flex-wrap gap-2">
          <FilterLink href="/dashboard/rentals" active={!statusFilter}>
            All
          </FilterLink>
          {Object.values(RENTAL_STATUS).map((s) => (
            <FilterLink
              key={s}
              href={`/dashboard/rentals?status=${s}`}
              active={statusFilter === s}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </FilterLink>
          ))}
        </div>
      </div>

      <RentalTable rentals={rentals} />
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  // Using <a> here is fine for a simple filter link within the same route.
  // Next.js will handle client-side navigation for same-origin links.
  return (
    <a
      href={href}
      className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      }`}
    >
      {children}
    </a>
  );
}

import { Suspense } from "react";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { getCars } from "@/lib/data/cars";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { Navbar } from "@/components/shared/navbar";
import { CarCard } from "@/components/cars/car-card";
import { CarFilters } from "@/components/cars/car-filters";
import { EmptyState } from "@/components/shared/empty-state";

type SortOption =
  | "price-asc"
  | "price-desc"
  | "year-asc"
  | "year-desc"
  | "mileage-asc"
  | "mileage-desc";

const VALID_SORTS: SortOption[] = [
  "price-asc",
  "price-desc",
  "year-asc",
  "year-desc",
  "mileage-asc",
  "mileage-desc",
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    showUnavailable?: string;
    sort?: string;
  }>;
}) {
  const [session, params] = await Promise.all([auth(), searchParams]);

  const showUnavailable = params.showUnavailable === "1";

  const sortFilter =
    params.sort && VALID_SORTS.includes(params.sort as SortOption)
      ? (params.sort as SortOption)
      : undefined;

  const cars = await getCars({
    search: params.search,
    status: showUnavailable ? undefined : "AVAILABLE",
    sort: sortFilter,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        brand={
          <Link href="/" className="text-xl font-bold">
            BerAuto
          </Link>
        }
      >
        <ThemeToggle />
        {session?.user ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <span className="text-sm text-muted-foreground">
              {session.user.name}
            </span>
            <SignOutButton />
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </>
        )}
      </Navbar>

      <main className="container mx-auto flex-1 px-4 py-8">
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-4xl">
            Welcome to BerAuto
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Find and rent the perfect car for your needs. Browse our selection
            of vehicles and submit a rental request in minutes.
          </p>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-semibold">Available Cars</h2>

          <div className="mb-8">
            <Suspense fallback={null}>
              <CarFilters />
            </Suspense>
          </div>

          {cars.length === 0 ? (
            <EmptyState
              message="No cars found matching your criteria."
              className="py-12"
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  bookable={car.status === "AVAILABLE"}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>BerAuto Car Rental {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

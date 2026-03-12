import { Suspense } from "react";
import {
  ArrowRight,
  CalendarRange,
  MapPinned,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { getCars } from "@/lib/data/cars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/cars/car-card";
import { CarFilters } from "@/components/cars/car-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { Navbar } from "@/components/shared/navbar";

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

  const displayedFleetLabel = showUnavailable
    ? "entire fleet visible"
    : "available cars only";

  const highlights = [
    {
      title: "City-smart lineup",
      description: "Compact commuters, roomy SUVs, and polished daily drivers.",
      icon: MapPinned,
    },
    {
      title: "Simple booking flow",
      description:
        "Pick a car, send a request, and keep everything in one place.",
      icon: CalendarRange,
    },
    {
      title: "Clear rental details",
      description: "Transparent rates and vehicle status before you commit.",
      icon: ShieldCheck,
    },
  ] satisfies Array<{
    title: string;
    description: string;
    icon: typeof MapPinned;
  }>;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-8">
        <section className="relative mb-12 overflow-hidden rounded-[2rem] border border-border/60 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_34%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(240,253,250,0.92))] px-6 py-8 shadow-sm sm:px-8 sm:py-10 lg:px-12 lg:py-12 dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(17,24,39,0.92))]">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(180deg,_rgba(255,255,255,0.34),_transparent)] lg:block dark:bg-[linear-gradient(180deg,_rgba(255,255,255,0.06),_transparent)]" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)] lg:items-center">
            <div className="min-w-0 space-y-6">
              <Badge
                variant="ghost"
                className="whitespace-normal rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em] lg:bg-primary lg:text-primary-foreground"
              >
                Fresh rides for workdays and getaways
              </Badge>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Catch the road in a car that feels chosen, not just booked.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  BerAuto keeps rental browsing fast and polished, with a fleet
                  you can filter in seconds and request without friction.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="shadow-lg shadow-primary/20"
                >
                  <Link href="#available-cars">
                    Explore the fleet
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg">
                  <Link href={session?.user ? "/dashboard" : "/register"}>
                    {session?.user ? "Open dashboard" : "Create an account"}
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-2xl border border-white/70 bg-white/75 p-3 backdrop-blur sm:p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xl font-semibold sm:text-2xl">
                    {cars.length}
                  </p>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    cars shown
                  </p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/75 p-3 backdrop-blur sm:p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xl font-semibold sm:text-2xl">Live</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    {displayedFleetLabel}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/75 p-3 backdrop-blur sm:p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xl font-semibold sm:text-2xl">Fast</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    search, sort, request
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[1.75rem] bg-primary/10 blur-2xl" />
              <div className="relative rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-black/20 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
                      Why BerAuto clicks
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">
                      A cleaner way to pick your next ride.
                    </p>
                  </div>
                  <div className="shrink-0 whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    On demand
                  </div>
                </div>

                <div className="space-y-3">
                  {highlights.map((highlight) => {
                    const Icon = highlight.icon;

                    return (
                      <div
                        key={highlight.title}
                        className="flex items-start gap-4 rounded-2xl border border-border/60 bg-background/70 p-4"
                      >
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                          <Icon className="size-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold">{highlight.title}</p>
                          <p className="text-sm leading-6 text-muted-foreground">
                            {highlight.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="available-cars">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
                Fleet selection
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Available cars
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Narrow the list by model, price, mileage, or availability to find
              the right match faster.
            </p>
          </div>

          <div className="mb-8 rounded-3xl border bg-card/70 p-4 shadow-sm backdrop-blur sm:p-5">
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
                  bookable={car.status === "AVAILABLE" && !car.inUse}
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

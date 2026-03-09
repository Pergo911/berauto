"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

import type { RentalStatus } from "@/types";
import { RENTAL_STATUS } from "@/types";

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`inline-flex shrink-0 items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-1 outline-border ${
        active
          ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          : "bg-transparent text-secondary-foreground hover:bg-secondary/20"
      }`}
    >
      {children}
    </a>
  );
}

export function FilterStrip({
  activeStatus,
}: {
  activeStatus: RentalStatus | undefined;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, []);

  const nudge = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -120 : 120,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="relative min-w-0 flex-1">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto p-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <FilterLink href="/dashboard" active={!activeStatus}>
            All
          </FilterLink>
          {Object.values(RENTAL_STATUS).map((s) => (
            <FilterLink
              key={s}
              href={`/dashboard?status=${s}`}
              active={activeStatus === s}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </FilterLink>
          ))}
        </div>

        {canScrollLeft && (
          <div className="absolute inset-y-0 left-0 flex items-center">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-background to-transparent" />
            <button
              onClick={() => nudge("left")}
              className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {canScrollRight && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-background to-transparent" />
            <button
              onClick={() => nudge("right")}
              className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

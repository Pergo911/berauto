"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdminCarFiltersProps = {
  defaults: {
    search?: string;
    status?: string;
    sort?: string;
  };
};

export function AdminCarFilters({ defaults }: AdminCarFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? defaults.search ?? "";
  const status = searchParams.get("status") ?? defaults.status ?? "";
  const sort = searchParams.get("sort") ?? defaults.sort ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.push(pathname + (qs ? `?${qs}` : ""));
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex gap-4 flex-wrap items-end">
      <div className="grid gap-2 flex-1 min-w-50">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          type="search"
          placeholder="Make, model, or plate..."
          defaultValue={search}
          onChange={(e) => updateParams({ search: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label>Status</Label>
        <Select
          value={status}
          onValueChange={(value) =>
            updateParams({ status: value === "all" ? "" : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Sort</Label>
        <Select
          value={sort || "newest"}
          onValueChange={(value) =>
            updateParams({ sort: value === "newest" ? "" : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Newest first" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="year-asc">Year: Oldest first</SelectItem>
            <SelectItem value="year-desc">Year: Newest first</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowUpDown, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function CarFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const showUnavailable = searchParams.get("showUnavailable") === "1";
  const sort = searchParams.get("sort") ?? "newest";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (!value || value === "newest") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      const qs = params.toString();
      router.replace(pathname + (qs ? `?${qs}` : ""), { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const toggleShowUnavailable = useCallback(
    (checked: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (checked) {
        params.set("showUnavailable", "1");
      } else {
        params.delete("showUnavailable");
      }
      const qs = params.toString();
      router.replace(pathname + (qs ? `?${qs}` : ""), { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9"
          placeholder="Search by make, model, or plate..."
          defaultValue={search}
          onChange={(e) => updateParams("search", e.target.value)}
        />
      </div>

      <Select
        value={sort}
        onValueChange={(value) => updateParams("sort", value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <ArrowUpDown className="size-4 text-muted-foreground" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price-asc">Price ↑</SelectItem>
          <SelectItem value="price-desc">Price ↓</SelectItem>
          <SelectItem value="year-asc">Year ↑</SelectItem>
          <SelectItem value="year-desc">Year ↓</SelectItem>
          <SelectItem value="mileage-asc">Mileage ↑</SelectItem>
          <SelectItem value="mileage-desc">Mileage ↓</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Switch
          id="show-unavailable"
          checked={showUnavailable}
          onCheckedChange={toggleShowUnavailable}
        />
        <Label htmlFor="show-unavailable" className="cursor-pointer">
          Show unavailable
        </Label>
      </div>
    </div>
  );
}

"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowUpDown, Search } from "lucide-react";

import { useRouter, usePathname } from "@/i18n/navigation";
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
  const t = useTranslations("CarFilters");
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
      router.replace((pathname + (qs ? `?${qs}` : "")) as "/");
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
      router.replace((pathname + (qs ? `?${qs}` : "")) as "/");
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9"
          placeholder={t("searchPlaceholder")}
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
          <SelectValue placeholder={t("sortPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{t("sortOptions.newest")}</SelectItem>
          <SelectItem value="price-asc">{t("sortOptions.priceAsc")}</SelectItem>
          <SelectItem value="price-desc">{t("sortOptions.priceDesc")}</SelectItem>
          <SelectItem value="year-asc">{t("sortOptions.yearAsc")}</SelectItem>
          <SelectItem value="year-desc">{t("sortOptions.yearDesc")}</SelectItem>
          <SelectItem value="mileage-asc">{t("sortOptions.mileageAsc")}</SelectItem>
          <SelectItem value="mileage-desc">{t("sortOptions.mileageDesc")}</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Switch
          id="show-unavailable"
          checked={showUnavailable}
          onCheckedChange={toggleShowUnavailable}
        />
        <Label htmlFor="show-unavailable" className="cursor-pointer">
          {t("showUnavailable")}
        </Label>
      </div>
    </div>
  );
}


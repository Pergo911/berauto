"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import type { CarDTO } from "@/lib/data/cars";
import type { BrandDTO } from "@/lib/data/brands";
import { createCarSchema, type CreateCarInput } from "@/lib/validations/cars";
import { BrandLogo } from "@/components/cars/brand-logo";
import { createCar, updateCar } from "@/actions/cars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CarFormProps = {
  car?: CarDTO;
  brands: BrandDTO[];
  onSuccess?: () => void;
};

export function CarForm({ car, brands, onSuccess }: CarFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("CarForm");

  const form = useForm<CreateCarInput>({
    resolver: zodResolver(createCarSchema) as Resolver<CreateCarInput>,
    defaultValues: {
      make: car?.make ?? "",
      model: car?.model ?? "",
      year: car?.year ?? new Date().getFullYear(),
      licensePlate: car?.licensePlate ?? "",
      mileageKm: car?.mileageKm ?? 0,
      dailyRate: car?.dailyRate ?? 0,
      status: car?.status ?? "AVAILABLE",
      brandId: car?.brandId ?? undefined,
    },
  });

  function onSubmit(data: CreateCarInput) {
    startTransition(async () => {
      const result = car
        ? await updateCar(car.id, data)
        : await createCar(data);

      if (result.success) {
        toast.success(car ? t("toastUpdated") : t("toastCreated"));
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        {/* Row 1: Brand (auto) | Make | Model */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr_1fr]">
          <FormField
            control={form.control}
            name="brandId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("brandLabel")}</FormLabel>
                <Select
                  onValueChange={(brandId) => {
                    field.onChange(brandId || undefined);
                    const brand = brands.find((b) => b.id === brandId);
                    if (brand) {
                      form.setValue("make", brand.name, {
                        shouldValidate: true,
                      });
                    }
                  }}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full sm:w-auto">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <SelectValue placeholder={t("brandPlaceholder")} />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-60">
                    {brands.map((brand) => (
                      <SelectItem
                        key={brand.id}
                        value={brand.id}
                        textValue={brand.name}
                      >
                        <div className="flex items-center gap-2">
                          <BrandLogo
                            logoPath={brand.logoPath}
                            brandName={brand.name}
                            size={20}
                          />
                          {brand.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("makeLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("makePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("modelLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("modelPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Year | License Plate | Mileage */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("yearLabel")}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("licensePlateLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("licensePlatePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mileageKm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("mileageLabel")}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: Daily Rate */}
        <FormField
          control={form.control}
          name="dailyRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("dailyRateLabel")}</FormLabel>
              <FormControl>
                <Input type="number" step="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row 4: Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("statusLabel")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("statusPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AVAILABLE">{t("statusAvailable")}</SelectItem>
                  <SelectItem value="MAINTENANCE">{t("statusMaintenance")}</SelectItem>
                  <SelectItem value="UNAVAILABLE">{t("statusUnavailable")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending
            ? car
              ? t("updatingButton")
              : t("creatingButton")
            : car
              ? t("updateButton")
              : t("createButton")}
        </Button>
      </form>
    </Form>
  );
}

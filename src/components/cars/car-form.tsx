"use client";

import { useTransition, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";

import type { CarDTO } from "@/lib/data/cars";
import type { BrandDTO } from "@/lib/data/brands";
import { createCarSchema, type CreateCarInput } from "@/lib/validations/cars";
import { BrandLogo } from "@/components/cars/brand-logo";
import { createCar, updateCar, deleteUploadthingFile } from "@/actions/cars";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
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

  const [imageUrl, setImageUrl] = useState<string | null>(
    car?.imageUrl ?? null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const { startUpload } = useUploadThing("carImage", {
    onUploadBegin: () => setIsUploading(true),
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      const url = res[0]?.serverData?.url ?? res[0]?.ufsUrl ?? null;
      if (url) setImageUrl(url);
    },
    onUploadError: () => {
      setIsUploading(false);
      toast.error("Image upload failed");
    },
  });

  async function handleImageFile(file: File) {
    if (imageUrl) {
      await deleteUploadthingFile(imageUrl);
    }
    await startUpload([file]);
  }

  async function handleRemoveImage() {
    if (!imageUrl) return;
    await deleteUploadthingFile(imageUrl);
    setImageUrl(null);
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (isUploading) return;
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) void handleImageFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isUploading, imageUrl]
  );

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
      imageUrl: car?.imageUrl ?? undefined,
    },
  });

  function onSubmit(data: CreateCarInput) {
    startTransition(async () => {
      const result = car
        ? await updateCar(car.id, { ...data, imageUrl })
        : await createCar({ ...data, imageUrl });

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
                  <Input
                    placeholder={t("licensePlatePlaceholder")}
                    {...field}
                  />
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
                  <SelectItem value="AVAILABLE">
                    {t("statusAvailable")}
                  </SelectItem>
                  <SelectItem value="MAINTENANCE">
                    {t("statusMaintenance")}
                  </SelectItem>
                  <SelectItem value="UNAVAILABLE">
                    {t("statusUnavailable")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload */}
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("imageLabel")}</p>
          <div
            className={cn(
              "relative overflow-hidden rounded-lg border-2 border-dashed bg-muted/30 transition-colors",
              isDragOver && !isUploading
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              if (!isUploading) setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            {imageUrl ? (
              <div className="relative">
                <Image
                  src={imageUrl}
                  alt="Car photo"
                  width={640}
                  height={360}
                  className="h-40 w-full object-cover"
                />
                {/* Drag-over overlay on existing image */}
                {isDragOver && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
                    <Upload className="size-8 text-white" />
                    <span className="text-sm font-medium text-white">
                      {t("imageDragActive")}
                    </span>
                  </div>
                )}
                {!isDragOver && (
                  <div className="absolute right-2 top-2 flex gap-2">
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-1.5 rounded-md border border-white/30 bg-black/50 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/70",
                        isUploading && "pointer-events-none opacity-60"
                      )}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="size-3 animate-spin" />
                          {t("imageUploading")}
                        </>
                      ) : (
                        <>
                          <ImagePlus className="size-3" />
                          {t("imageReplace")}
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleImageFile(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => void handleRemoveImage()}
                      disabled={isUploading}
                      className="flex items-center gap-1.5 rounded-md border border-white/30 bg-black/50 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-red-600/80"
                    >
                      <X className="size-3" />
                      {t("imageRemove")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <label
                className={cn(
                  "flex h-36 cursor-pointer flex-col items-center justify-center gap-2 transition-colors hover:bg-muted/50",
                  isUploading && "pointer-events-none",
                  isDragOver && !isUploading
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-7 animate-spin" />
                    <span className="text-sm font-medium">
                      {t("imageUploading")}
                    </span>
                  </>
                ) : isDragOver ? (
                  <>
                    <Upload className="size-7" />
                    <span className="text-sm font-medium">
                      {t("imageDragActive")}
                    </span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="size-7" />
                    <span className="text-sm font-medium">
                      {t("imageUpload")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("imageHint")}
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleImageFile(file);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || isUploading}
          className="w-full sm:w-auto"
        >
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

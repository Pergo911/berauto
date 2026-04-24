"use server";

import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { cars, rentals } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getRentals } from "@/lib/data/rentals";
import { utapi } from "@/app/api/uploadthing/core";
import { createCarSchema, updateCarSchema } from "@/lib/validations/cars";
import { idSchema } from "@/lib/validations/rentals";

import type { RentalDTO } from "@/lib/data/rentals";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createCar(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = createCarSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const {
    make,
    model,
    year,
    licensePlate,
    mileageKm,
    dailyRate,
    status,
    brandId,
    imageUrl,
  } = parsed.data;

  const [car] = await db
    .insert(cars)
    .values({
      make,
      model,
      year,
      licensePlate,
      mileageKm,
      dailyRate: dailyRate.toString(),
      status,
      brandId: brandId ?? null,
      imageUrl: imageUrl ?? null,
    })
    .returning({ id: cars.id });

  revalidatePath("/");
  revalidatePath("/admin/cars");

  return { success: true, data: { id: car.id } };
}

export async function updateCar(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const idParsed = idSchema.safeParse(id);
  if (!idParsed.success) {
    return { success: false, error: "Invalid ID" };
  }

  const parsed = updateCarSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const updateData: Record<string, unknown> = {
    ...parsed.data,
    updatedAt: new Date(),
  };

  if (parsed.data.dailyRate !== undefined) {
    updateData.dailyRate = parsed.data.dailyRate.toString();
  }

  // Allow explicitly setting imageUrl to null (image removal)
  if ("imageUrl" in parsed.data) {
    updateData.imageUrl = parsed.data.imageUrl ?? null;
  }

  const [car] = await db
    .update(cars)
    .set(updateData)
    .where(eq(cars.id, id))
    .returning({ id: cars.id });

  if (!car) {
    return { success: false, error: "Car not found" };
  }

  revalidatePath("/");
  revalidatePath("/admin/cars");
  revalidatePath(`/cars/${id}`);

  return { success: true, data: { id: car.id } };
}

export async function deleteCar(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const idParsed = idSchema.safeParse(id);
  if (!idParsed.success) {
    return { success: false, error: "Invalid ID" };
  }

  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  // Check for active or pending rentals
  const activeRentals = await db
    .select({ id: rentals.id })
    .from(rentals)
    .where(
      and(
        eq(rentals.carId, id),
        inArray(rentals.status, ["PENDING", "APPROVED", "ACTIVE"])
      )
    )
    .limit(1);

  if (activeRentals.length > 0) {
    return {
      success: false,
      error: "Cannot delete car with active/pending rentals",
    };
  }

  const [car] = await db
    .update(cars)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(cars.id, id))
    .returning({ id: cars.id });

  if (!car) {
    return { success: false, error: "Car not found" };
  }

  revalidatePath("/");
  revalidatePath("/admin/cars");

  return { success: true, data: { id: car.id } };
}

// ── Get Car Rental History (for detail dialog) ─────────

export async function getCarRentalHistory(
  carId: string
): Promise<ActionResult<RentalDTO[]>> {
  const idParsed = idSchema.safeParse(carId);
  if (!idParsed.success) {
    return { success: false, error: "Invalid ID" };
  }

  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const rentalList = await getRentals({ carId, sort: "newest" });
  return { success: true, data: rentalList };
}

// ── Delete UploadThing image file ──────────────────────

/** Extract the UploadThing file key from a ufs URL (e.g. https://utfs.io/f/<key> or https://<app>.ufs.sh/f/<key>). */
function extractFileKey(url: string): string | null {
  try {
    const { pathname } = new URL(url);
    const parts = pathname.split("/");
    const fIndex = parts.indexOf("f");
    return fIndex !== -1 && parts[fIndex + 1] ? parts[fIndex + 1] : null;
  } catch {
    return null;
  }
}

export async function deleteUploadthingFile(
  url: string
): Promise<ActionResult<void>> {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const key = extractFileKey(url);
  if (!key) return { success: false, error: "Invalid file URL" };

  await utapi.deleteFiles(key);
  return { success: true, data: undefined };
}

"use server";

import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { cars, rentals } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createCarSchema, updateCarSchema } from "@/lib/validations/cars";
import { idSchema } from "@/lib/validations/rentals";

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

  const { make, model, year, licensePlate, mileageKm, dailyRate, status } =
    parsed.data;

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
    .delete(cars)
    .where(eq(cars.id, id))
    .returning({ id: cars.id });

  if (!car) {
    return { success: false, error: "Car not found" };
  }

  revalidatePath("/");
  revalidatePath("/admin/cars");

  return { success: true, data: { id: car.id } };
}

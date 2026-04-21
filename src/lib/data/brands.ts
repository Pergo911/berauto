import { asc } from "drizzle-orm";

import { db } from "@/db";
import { brands } from "@/db/schema";

export type BrandDTO = {
  id: string;
  name: string;
  logoPath: string;
};

export async function getBrands(): Promise<BrandDTO[]> {
  return await db.select().from(brands).orderBy(asc(brands.name));
}

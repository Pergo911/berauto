// Seed script — run with `pnpm db:seed`
// This file creates demo data for local development.

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcryptjs from "bcryptjs";

import * as schema from "./schema";

async function seed() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error("DATABASE_URL is not set. Copy .env.example to .env.local and fill in your Neon connection string.");
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);
  const db = drizzle({ client: sql, schema });

  console.log("Seeding database...");

  // Create demo users
  const passwordHash = await bcryptjs.hash("password123", 12);

  await db.insert(schema.users).values([
    {
      email: "admin@berauto.hu",
      passwordHash,
      name: "Admin User",
      role: "admin",
    },
    {
      email: "agent@berauto.hu",
      passwordHash,
      name: "Agent User",
      role: "agent",
    },
    {
      email: "user@berauto.hu",
      passwordHash,
      name: "Demo User",
      role: "user",
      address: "Budapest, Fo utca 1.",
      phone: "+36 1 234 5678",
    },
  ]);

  // Create demo cars
  await db.insert(schema.cars).values([
    {
      make: "Toyota",
      model: "Corolla",
      year: 2022,
      licensePlate: "ABC-123",
      mileageKm: 15000,
      dailyRate: "8500.00",
      isAvailable: true,
      status: "AVAILABLE",
    },
    {
      make: "Volkswagen",
      model: "Golf",
      year: 2023,
      licensePlate: "DEF-456",
      mileageKm: 8000,
      dailyRate: "12000.00",
      isAvailable: true,
      status: "AVAILABLE",
    },
    {
      make: "BMW",
      model: "320i",
      year: 2021,
      licensePlate: "GHI-789",
      mileageKm: 32000,
      dailyRate: "18000.00",
      isAvailable: true,
      status: "AVAILABLE",
    },
  ]);

  console.log("Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

// Seed script — run with `pnpm db:seed`
// Populates all tables with demo data for local development.
// Idempotent: clears existing data before re-inserting.

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcryptjs from "bcryptjs";

import * as schema from "./schema";

// ── Helpers ────────────────────────────────────────────

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days: number): Date {
  return daysFromNow(-days);
}

// ── Seed ───────────────────────────────────────────────

async function seed() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill in your Neon connection string.",
    );
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);
  const db = drizzle({ client: sql, schema });

  console.log("🌱 Seeding database…");

  // ── 1. Clean all data (in FK order) ──────────────────

  console.log("  Clearing invoices, rental_events, rentals, cars, users…");
  await db.delete(schema.invoices);
  await db.delete(schema.rentalEvents);
  await db.delete(schema.rentals);
  await db.delete(schema.cars);
  await db.delete(schema.users);

  // ── 2. Insert users ─────────────────────────────────

  console.log("  Inserting users…");

  const passwordHash = await bcryptjs.hash("password123", 12);

  const insertedUsers = await db
    .insert(schema.users)
    .values([
      {
        email: "admin@berauto.hu",
        passwordHash,
        name: "Admin User",
        role: "admin" as const,
      },
      {
        email: "agent@berauto.hu",
        passwordHash,
        name: "Agent User",
        role: "agent" as const,
      },
      {
        email: "user@berauto.hu",
        passwordHash,
        name: "Demo User",
        role: "user" as const,
        address: "Budapest, Fő utca 1.",
        phone: "+36 1 234 5678",
      },
      {
        email: "janos.kiss@example.com",
        passwordHash,
        name: "Kiss János",
        role: "user" as const,
        address: "Debrecen, Kossuth tér 5.",
        phone: "+36 30 987 6543",
      },
      {
        email: "maria.nagy@example.com",
        passwordHash,
        name: "Nagy Mária",
        role: "user" as const,
        address: "Szeged, Tisza Lajos krt. 12.",
        phone: "+36 20 456 7890",
      },
    ])
    .returning();

  const admin = insertedUsers.find((u) => u.role === "admin")!;
  const agent = insertedUsers.find((u) => u.role === "agent")!;
  const regularUser = insertedUsers.find(
    (u) => u.email === "user@berauto.hu",
  )!;
  const janos = insertedUsers.find(
    (u) => u.email === "janos.kiss@example.com",
  )!;
  const maria = insertedUsers.find(
    (u) => u.email === "maria.nagy@example.com",
  )!;

  console.log(`  Created ${insertedUsers.length} users (password: password123)`);

  // ── 3. Insert cars ───────────────────────────────────

  console.log("  Inserting cars…");

  const carsData: (typeof schema.cars.$inferInsert)[] = [
    {
      make: "Toyota",
      model: "Corolla",
      year: 2022,
      licensePlate: "ABC-123",
      mileageKm: 15_000,
      dailyRate: "8500.00",
      isAvailable: true,
      status: "AVAILABLE",
    },
    {
      make: "Volkswagen",
      model: "Golf",
      year: 2023,
      licensePlate: "DEF-456",
      mileageKm: 8_000,
      dailyRate: "12000.00",
      isAvailable: true,
      status: "AVAILABLE",
    },
    {
      make: "BMW",
      model: "320i",
      year: 2021,
      licensePlate: "GHI-789",
      mileageKm: 32_000,
      dailyRate: "18000.00",
      isAvailable: true,
      status: "AVAILABLE",
    },
    {
      make: "Audi",
      model: "A4",
      year: 2023,
      licensePlate: "JKL-012",
      mileageKm: 5_200,
      dailyRate: "22000.00",
      isAvailable: true,
      status: "AVAILABLE",
    },
    {
      make: "Mercedes-Benz",
      model: "C200",
      year: 2022,
      licensePlate: "MNO-345",
      mileageKm: 18_700,
      dailyRate: "25000.00",
      isAvailable: false,
      status: "RENTED",
    },
    {
      make: "Opel",
      model: "Astra",
      year: 2020,
      licensePlate: "PQR-678",
      mileageKm: 54_300,
      dailyRate: "7000.00",
      isAvailable: true,
      status: "AVAILABLE",
    },
    {
      make: "Škoda",
      model: "Octavia",
      year: 2024,
      licensePlate: "STU-901",
      mileageKm: 1_200,
      dailyRate: "14000.00",
      isAvailable: true,
      status: "AVAILABLE",
    },
    {
      make: "Ford",
      model: "Focus",
      year: 2019,
      licensePlate: "VWX-234",
      mileageKm: 78_600,
      dailyRate: "6500.00",
      isAvailable: false,
      status: "MAINTENANCE",
    },
    {
      make: "Renault",
      model: "Mégane",
      year: 2021,
      licensePlate: "YZA-567",
      mileageKm: 41_000,
      dailyRate: "9000.00",
      isAvailable: true,
      status: "AVAILABLE",
    },
    {
      make: "Suzuki",
      model: "Vitara",
      year: 2023,
      licensePlate: "BCD-890",
      mileageKm: 12_400,
      dailyRate: "11000.00",
      isAvailable: false,
      status: "RENTED",
    },
  ];

  const insertedCars = await db
    .insert(schema.cars)
    .values(carsData)
    .returning();

  const carByPlate = (plate: string) => {
    const car = insertedCars.find((c) => c.licensePlate === plate);
    if (!car) throw new Error(`Car ${plate} not found after insert`);
    return car;
  };

  // ── 4. Insert rentals ───────────────────────────────

  console.log("  Inserting rentals…");

  const rentalsData: (typeof schema.rentals.$inferInsert)[] = [
    // R1 — CLOSED: registered user, completed in the past
    {
      carId: carByPlate("ABC-123").id,
      userId: regularUser.id,
      startDate: daysAgo(30),
      endDate: daysAgo(25),
      status: "CLOSED",
      agentId: agent.id,
      createdAt: daysAgo(32),
      updatedAt: daysAgo(25),
    },
    // R2 — ACTIVE: Mercedes currently rented by registered user
    {
      carId: carByPlate("MNO-345").id,
      userId: janos.id,
      startDate: daysAgo(3),
      endDate: daysFromNow(4),
      status: "ACTIVE",
      agentId: agent.id,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(3),
    },
    // R3 — PENDING: guest rental request
    {
      carId: carByPlate("DEF-456").id,
      guestName: "Kovács Péter",
      guestEmail: "kovacs.peter@example.com",
      guestPhone: "+36 30 111 2222",
      startDate: daysFromNow(5),
      endDate: daysFromNow(10),
      status: "PENDING",
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    // R4 — APPROVED: registered user, waiting for handover
    {
      carId: carByPlate("STU-901").id,
      userId: maria.id,
      startDate: daysFromNow(2),
      endDate: daysFromNow(7),
      status: "APPROVED",
      agentId: agent.id,
      createdAt: daysAgo(3),
      updatedAt: daysAgo(2),
    },
    // R5 — REJECTED: guest rental that was denied
    {
      carId: carByPlate("GHI-789").id,
      guestName: "Nagy Anna",
      guestEmail: "nagy.anna@example.com",
      guestPhone: "+36 20 333 4444",
      startDate: daysAgo(10),
      endDate: daysAgo(5),
      status: "REJECTED",
      agentId: agent.id,
      createdAt: daysAgo(12),
      updatedAt: daysAgo(11),
    },
    // R6 — ACTIVE: Suzuki Vitara rented by guest
    {
      carId: carByPlate("BCD-890").id,
      guestName: "Tóth László",
      guestEmail: "toth.laszlo@example.com",
      guestPhone: "+36 70 555 6666",
      startDate: daysAgo(2),
      endDate: daysFromNow(5),
      status: "ACTIVE",
      agentId: agent.id,
      createdAt: daysAgo(4),
      updatedAt: daysAgo(2),
    },
    // R7 — CLOSED: past guest rental on Opel Astra
    {
      carId: carByPlate("PQR-678").id,
      guestName: "Szabó Éva",
      guestEmail: "szabo.eva@example.com",
      guestPhone: "+36 30 777 8888",
      startDate: daysAgo(20),
      endDate: daysAgo(15),
      status: "CLOSED",
      agentId: agent.id,
      createdAt: daysAgo(22),
      updatedAt: daysAgo(15),
    },
    // R8 — PENDING: registered user wants Audi
    {
      carId: carByPlate("JKL-012").id,
      userId: regularUser.id,
      startDate: daysFromNow(10),
      endDate: daysFromNow(17),
      status: "PENDING",
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    // R9 — CLOSED: older rental on Renault by János
    {
      carId: carByPlate("YZA-567").id,
      userId: janos.id,
      startDate: daysAgo(45),
      endDate: daysAgo(40),
      status: "CLOSED",
      agentId: agent.id,
      createdAt: daysAgo(47),
      updatedAt: daysAgo(40),
    },
    // R10 — PENDING: guest wants Golf
    {
      carId: carByPlate("DEF-456").id,
      guestName: "Horváth Gábor",
      guestEmail: "horvath.gabor@example.com",
      guestPhone: "+36 20 999 0000",
      startDate: daysFromNow(15),
      endDate: daysFromNow(20),
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // R11 — CLOSED: Mária rented Corolla previously
    {
      carId: carByPlate("ABC-123").id,
      userId: maria.id,
      startDate: daysAgo(60),
      endDate: daysAgo(55),
      status: "CLOSED",
      agentId: agent.id,
      createdAt: daysAgo(62),
      updatedAt: daysAgo(55),
    },
    // R12 — APPROVED: János wants BMW next week
    {
      carId: carByPlate("GHI-789").id,
      userId: janos.id,
      startDate: daysFromNow(3),
      endDate: daysFromNow(8),
      status: "APPROVED",
      agentId: agent.id,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1),
    },
  ];

  const insertedRentals = await db
    .insert(schema.rentals)
    .values(rentalsData)
    .returning();

  // Helper to look up a rental by index (matches insertion order above)
  const r = (index: number) => insertedRentals[index]!;

  // ── 5. Insert rental events ──────────────────────────

  console.log("  Inserting rental events…");

  const eventsData: (typeof schema.rentalEvents.$inferInsert)[] = [
    // R1 (CLOSED) — full lifecycle
    { rentalId: r(0).id, eventType: "REQUEST", actorId: regularUser.id, notes: "Online rental request", timestamp: daysAgo(32) },
    { rentalId: r(0).id, eventType: "APPROVE", actorId: agent.id, notes: "Documents verified", timestamp: daysAgo(31) },
    { rentalId: r(0).id, eventType: "HANDOVER", actorId: agent.id, notes: "Keys handed over, mileage: 14,200 km", timestamp: daysAgo(30) },
    { rentalId: r(0).id, eventType: "RETURN", actorId: agent.id, notes: "Returned in good condition, mileage: 14,850 km", timestamp: daysAgo(25) },

    // R2 (ACTIVE) — approved and handed over (János)
    { rentalId: r(1).id, eventType: "REQUEST", actorId: janos.id, notes: "Registered user request", timestamp: daysAgo(5) },
    { rentalId: r(1).id, eventType: "APPROVE", actorId: agent.id, notes: "Approved for Mercedes C200", timestamp: daysAgo(4) },
    { rentalId: r(1).id, eventType: "HANDOVER", actorId: agent.id, notes: "Keys handed over, mileage: 18,500 km", timestamp: daysAgo(3) },

    // R3 (PENDING) — just requested
    { rentalId: r(2).id, eventType: "REQUEST", notes: "Guest rental request — Kovács Péter", timestamp: daysAgo(1) },

    // R4 (APPROVED) — requested + approved (Mária)
    { rentalId: r(3).id, eventType: "REQUEST", actorId: maria.id, notes: "Wants Škoda Octavia for a trip", timestamp: daysAgo(3) },
    { rentalId: r(3).id, eventType: "APPROVE", actorId: agent.id, notes: "Approved, scheduled pickup in 2 days", timestamp: daysAgo(2) },

    // R5 (REJECTED) — requested + rejected
    { rentalId: r(4).id, eventType: "REQUEST", notes: "Guest request — Nagy Anna", timestamp: daysAgo(12) },
    { rentalId: r(4).id, eventType: "REJECT", actorId: agent.id, notes: "Incomplete documentation provided", timestamp: daysAgo(11) },

    // R6 (ACTIVE) — guest, approved and handed over
    { rentalId: r(5).id, eventType: "REQUEST", notes: "Guest request — Tóth László", timestamp: daysAgo(4) },
    { rentalId: r(5).id, eventType: "APPROVE", actorId: agent.id, notes: "Guest docs verified", timestamp: daysAgo(3) },
    { rentalId: r(5).id, eventType: "HANDOVER", actorId: agent.id, notes: "Suzuki Vitara handed over, mileage: 12,200 km", timestamp: daysAgo(2) },

    // R7 (CLOSED) — full lifecycle, guest
    { rentalId: r(6).id, eventType: "REQUEST", notes: "Guest request — Szabó Éva", timestamp: daysAgo(22) },
    { rentalId: r(6).id, eventType: "APPROVE", actorId: agent.id, notes: "Approved for Opel Astra", timestamp: daysAgo(21) },
    { rentalId: r(6).id, eventType: "HANDOVER", actorId: agent.id, notes: "Keys handed over, mileage: 53,800 km", timestamp: daysAgo(20) },
    { rentalId: r(6).id, eventType: "RETURN", actorId: agent.id, notes: "Returned, mileage: 54,300 km. Minor scratch on bumper noted.", timestamp: daysAgo(15) },

    // R8 (PENDING) — just requested
    { rentalId: r(7).id, eventType: "REQUEST", actorId: regularUser.id, notes: "Wants Audi A4 for a business trip", timestamp: daysAgo(1) },

    // R9 (CLOSED) — full lifecycle (János)
    { rentalId: r(8).id, eventType: "REQUEST", actorId: janos.id, notes: "Renault Mégane for vacation", timestamp: daysAgo(47) },
    { rentalId: r(8).id, eventType: "APPROVE", actorId: agent.id, notes: "Approved", timestamp: daysAgo(46) },
    { rentalId: r(8).id, eventType: "HANDOVER", actorId: agent.id, notes: "Handed over, mileage: 40,200 km", timestamp: daysAgo(45) },
    { rentalId: r(8).id, eventType: "RETURN", actorId: agent.id, notes: "Returned, mileage: 41,000 km", timestamp: daysAgo(40) },

    // R10 (PENDING) — just requested
    { rentalId: r(9).id, eventType: "REQUEST", notes: "Guest request — Horváth Gábor", timestamp: new Date() },

    // R11 (CLOSED) — full lifecycle (Mária, older)
    { rentalId: r(10).id, eventType: "REQUEST", actorId: maria.id, notes: "Wants Corolla for a weekend trip", timestamp: daysAgo(62) },
    { rentalId: r(10).id, eventType: "APPROVE", actorId: agent.id, notes: "Approved", timestamp: daysAgo(61) },
    { rentalId: r(10).id, eventType: "HANDOVER", actorId: agent.id, notes: "Handed over, mileage: 13,500 km", timestamp: daysAgo(60) },
    { rentalId: r(10).id, eventType: "RETURN", actorId: agent.id, notes: "Returned, mileage: 14,100 km", timestamp: daysAgo(55) },

    // R12 (APPROVED) — János wants BMW (requested + approved)
    { rentalId: r(11).id, eventType: "REQUEST", actorId: janos.id, notes: "BMW 320i for business travel", timestamp: daysAgo(2) },
    { rentalId: r(11).id, eventType: "APPROVE", actorId: agent.id, notes: "Approved, pickup scheduled", timestamp: daysAgo(1) },
  ];

  await db.insert(schema.rentalEvents).values(eventsData);

  // ── 6. Insert invoices (for CLOSED rentals) ──────────

  console.log("  Inserting invoices…");

  const invoicesData: (typeof schema.invoices.$inferInsert)[] = [
    // R1 — Toyota Corolla, 5 days × 8,500 Ft = 42,500 Ft
    {
      rentalId: r(0).id,
      amount: "42500.00",
      issuedAt: daysAgo(25),
      issuedBy: agent.id,
      pdfUrl: null,
    },
    // R7 — Opel Astra, 5 days × 7,000 Ft = 35,000 Ft
    {
      rentalId: r(6).id,
      amount: "35000.00",
      issuedAt: daysAgo(15),
      issuedBy: agent.id,
      pdfUrl: null,
    },
    // R9 — Renault Mégane, 5 days × 9,000 Ft = 45,000 Ft
    {
      rentalId: r(8).id,
      amount: "45000.00",
      issuedAt: daysAgo(40),
      issuedBy: admin.id,
      pdfUrl: null,
    },
    // R11 — Toyota Corolla, 5 days × 8,500 Ft = 42,500 Ft (Mária)
    {
      rentalId: r(10).id,
      amount: "42500.00",
      issuedAt: daysAgo(55),
      issuedBy: agent.id,
      pdfUrl: null,
    },
  ];

  await db.insert(schema.invoices).values(invoicesData);

  // ── Done ────────────────────────────────────────────

  console.log("\n✅ Seed complete!");
  console.log(`   ${insertedCars.length} cars`);
  console.log(`   ${insertedRentals.length} rentals`);
  console.log(`   ${eventsData.length} rental events`);
  console.log(`   ${invoicesData.length} invoices`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

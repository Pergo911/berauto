import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["user", "agent", "admin"]);

export const rentalStatusEnum = pgEnum("rental_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ACTIVE",
  "CLOSED",
]);

export const rentalEventTypeEnum = pgEnum("rental_event_type", [
  "REQUEST",
  "APPROVE",
  "REJECT",
  "HANDOVER",
  "RETURN",
]);

export const carStatusEnum = pgEnum("car_status", [
  "AVAILABLE",
  "RENTED",
  "MAINTENANCE",
]);

// ── Users ──────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Cars ───────────────────────────────────────────────

export const cars = pgTable("cars", {
  id: uuid("id").primaryKey().defaultRandom(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  licensePlate: varchar("license_plate", { length: 20 }).notNull().unique(),
  mileageKm: integer("mileage_km").notNull().default(0),
  dailyRate: numeric("daily_rate", { precision: 10, scale: 2 }).notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  status: carStatusEnum("status").notNull().default("AVAILABLE"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Rentals ────────────────────────────────────────────

export const rentals = pgTable("rentals", {
  id: uuid("id").primaryKey().defaultRandom(),
  carId: uuid("car_id")
    .notNull()
    .references(() => cars.id),
  userId: uuid("user_id").references(() => users.id),
  guestName: varchar("guest_name", { length: 255 }),
  guestEmail: varchar("guest_email", { length: 255 }),
  guestPhone: varchar("guest_phone", { length: 50 }),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  status: rentalStatusEnum("status").notNull().default("PENDING"),
  agentId: uuid("agent_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Rental Events ──────────────────────────────────────

export const rentalEvents = pgTable("rental_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  rentalId: uuid("rental_id")
    .notNull()
    .references(() => rentals.id),
  eventType: rentalEventTypeEnum("event_type").notNull(),
  actorId: uuid("actor_id").references(() => users.id),
  notes: text("notes"),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Invoices ───────────────────────────────────────────

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  rentalId: uuid("rental_id")
    .notNull()
    .references(() => rentals.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  issuedBy: uuid("issued_by")
    .notNull()
    .references(() => users.id),
  pdfUrl: text("pdf_url"),
});

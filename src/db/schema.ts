import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["user", "agent", "admin"]);

export const rentalStatusEnum = pgEnum("rental_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ACTIVE",
  "CLOSED",
  "CLOSED_INVOICED",
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
  "MAINTENANCE",
  "UNAVAILABLE",
]);

// ── Brands ──────────────────────────────────────────────

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  logoPath: varchar("logo_path", { length: 255 }).notNull(),
});

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

export const cars = pgTable(
  "cars",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    make: varchar("make", { length: 100 }).notNull(),
    model: varchar("model", { length: 100 }).notNull(),
    year: integer("year").notNull(),
    licensePlate: varchar("license_plate", { length: 20 }).notNull().unique(),
    mileageKm: integer("mileage_km").notNull().default(0),
    dailyRate: numeric("daily_rate", { precision: 10, scale: 2 }).notNull(),
    status: carStatusEnum("status").notNull().default("AVAILABLE"),
    brandId: uuid("brand_id").references(() => brands.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("cars_status_idx").on(table.status)]
);

// ── Rentals ────────────────────────────────────────────

export const rentals = pgTable(
  "rentals",
  {
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
  },
  (table) => [
    index("rentals_car_status_idx").on(table.carId, table.status),
    index("rentals_user_created_idx").on(table.userId, table.createdAt),
    index("rentals_agent_created_idx").on(table.agentId, table.createdAt),
    index("rentals_status_created_idx").on(table.status, table.createdAt),
  ]
);

// ── Rental Events ──────────────────────────────────────

export const rentalEvents = pgTable(
  "rental_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rentalId: uuid("rental_id")
      .notNull()
      .references(() => rentals.id),
    eventType: rentalEventTypeEnum("event_type").notNull(),
    actorId: uuid("actor_id").references(() => users.id),
    notes: text("notes"),
    mileageKm: integer("mileage_km"),
    timestamp: timestamp("timestamp", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("rental_events_rental_timestamp_idx").on(
      table.rentalId,
      table.timestamp
    ),
  ]
);

// ── Invoices ───────────────────────────────────────────

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rentalId: uuid("rental_id")
      .notNull()
      .references(() => rentals.id)
      .unique(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    issuedBy: uuid("issued_by")
      .notNull()
      .references(() => users.id),
  },
  (table) => [index("invoices_issued_at_idx").on(table.issuedAt)]
);

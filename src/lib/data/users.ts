import { asc, eq, ilike, or, sql } from "drizzle-orm";

import type { UserRole } from "@/types";
import { db } from "@/db";
import { users } from "@/db/schema";

// ── DTO ────────────────────────────────────────────────

export type UserDTO = {
  id: string;
  email: string;
  name: string;
  address: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
};

/** Select-set that excludes `passwordHash`. */
const userColumns = {
  id: users.id,
  email: users.email,
  name: users.name,
  address: users.address,
  phone: users.phone,
  role: users.role,
  createdAt: users.createdAt,
} as const;

// ── Queries ────────────────────────────────────────────

/** List all users that have the given role. */
export async function getUsersByRole(role: UserRole): Promise<UserDTO[]> {
  const rows = await db
    .select(userColumns)
    .from(users)
    .where(eq(users.role, role))
    .orderBy(asc(users.name));

  return rows;
}

/**
 * Search users by name, email, or ID prefix (case-insensitive).
 * Requires at least 2 characters; returns an empty array otherwise.
 */
export async function searchUsers(query: string): Promise<UserDTO[]> {
  if (query.length < 2) return [];

  const term = `%${query}%`;

  const rows = await db
    .select(userColumns)
    .from(users)
    .where(
      or(
        ilike(users.name, term),
        ilike(users.email, term),
        sql`${users.id}::text ILIKE ${term}`
      )
    )
    .orderBy(asc(users.name))
    .limit(20);

  return rows;
}

/** Get a single user by ID (without passwordHash), or `null` if not found. */
export async function getUserById(id: string): Promise<UserDTO | null> {
  const [row] = await db
    .select(userColumns)
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return row ?? null;
}

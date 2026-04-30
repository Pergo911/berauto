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
  emailVerified: boolean;
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
  emailVerified: users.emailVerified,
  createdAt: users.createdAt,
} as const;

export type RentalBlockReason = "email-unverified" | "profile-incomplete";

/**
 * Returns the reason a logged-in user is blocked from submitting a rental
 * request, or `null` if the user is eligible.
 */
export function getRentalBlockReason(
  user: Pick<UserDTO, "emailVerified" | "phone" | "address">
): RentalBlockReason | null {
  if (!user.emailVerified) return "email-unverified";
  if (!user.phone?.trim() || !user.address?.trim()) return "profile-incomplete";
  return null;
}

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

/** Get a single user with passwordHash by ID (for auth operations). */
export async function getUserByIdWithPassword(
  id: string
): Promise<(UserDTO & { passwordHash: string | null }) | null> {
  const [row] = await db
    .select({
      ...userColumns,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return row ?? null;
}

/** Update user settings (name, phone, address) and optionally password. */
export async function updateUserSettings(
  id: string,
  data: {
    name?: string;
    phone: string | null;
    address: string | null;
    passwordHash?: string | null;
  }
): Promise<UserDTO | null> {
  const updateData: Record<string, unknown> = {
    phone: data.phone,
    address: data.address,
    updatedAt: new Date(),
  };

  if (data.name) {
    updateData.name = data.name;
  }

  if (data.passwordHash) {
    updateData.passwordHash = data.passwordHash;
  }

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      address: users.address,
      phone: users.phone,
      role: users.role,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    });

  return updated ?? null;
}

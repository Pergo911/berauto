import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// During CI builds (SKIP_ENV_VALIDATION=1) DATABASE_URL is not available.
// Provide a syntactically valid dummy URL so neon() doesn't throw at import
// time. The connection is never actually used during the build.
const connectionString =
  process.env.DATABASE_URL ||
  (process.env.SKIP_ENV_VALIDATION
    ? "postgresql://placeholder:placeholder@localhost:5432/placeholder"
    : undefined);

const sql = neon(connectionString!);

export const db = drizzle({ client: sql, schema });

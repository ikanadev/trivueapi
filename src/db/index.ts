import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { config } from '@/utils';

export async function migrateSchema() {
  const sql = postgres(config.databaseUrl, { max: 1 });
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: "migrations" });
  await sql.end();
}

export function setupDb() {
  const queryClient = postgres(config.databaseUrl);
  const db = drizzle(queryClient);
  return db;
}

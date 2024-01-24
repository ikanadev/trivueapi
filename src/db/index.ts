import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { config } from "../utils";

export function setupDb() {
  const queryClient = postgres(config.databaseUrl);
  const db = drizzle(queryClient);
  return db;
}

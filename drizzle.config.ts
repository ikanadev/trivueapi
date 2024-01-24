import type { Config } from "drizzle-kit";
import { trivueDbSchema } from './src/apps/trivue';
import { config } from "./src/utils";

export default {
  schema: ["./src/apps/trivue/schema.ts"],
  driver: "pg",
  schemaFilter: [trivueDbSchema],
  dbCredentials: {
    connectionString: config.databaseUrl,
  },
} satisfies Config;

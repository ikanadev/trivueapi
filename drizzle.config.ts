import { config } from "@/utils";
import type { Config } from "drizzle-kit";
import { trivueDbSchema } from '@/apps/trivue';

export default {
  schema: ["./src/apps/trivue/schema.ts"],
  driver: "pg",
  schemaFilter: [trivueDbSchema],
  dbCredentials: {
    connectionString: config.databaseUrl,
  },
} satisfies Config;

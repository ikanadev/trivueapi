import { config } from "@/utils";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/index.ts",
  driver: "pg",
  dbCredentials: {
    connectionString: config.databaseUrl,
  },
} satisfies Config;

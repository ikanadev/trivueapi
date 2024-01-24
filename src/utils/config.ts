import dotenv from "dotenv";

dotenv.config();
export const config = {
  port: process.env.PORT || "",
  databaseUrl: process.env.DATABASE_URL || "",
  isProd: process.env.NODE_ENV === "production",
};

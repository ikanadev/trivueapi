import { Elysia } from "elysia";
import { setupDb } from "@/db";
import { config } from "@/utils";
import { questions } from "@/schema";

const db = setupDb();

const app = new Elysia();
app.get("/health", () => "Working!");
app.listen({ port: config.port }, () => {
  console.log(`🦊 Running at ${app.server?.hostname}:${app.server?.port}`);
});

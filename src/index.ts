import { Elysia } from "elysia";
import { setupDb } from "@/db";
import { questions } from "@/schema";

/*
const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
*/

async function main() {
  const db = setupDb();
  const result = await db.select().from(questions);
  console.log(result);
}

main();

import { Elysia } from "elysia";
import { setupDb } from "@/db";

/*
const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
*/

async function main() {
  const db = setupDb();
  console.log(typeof db);
}

main();

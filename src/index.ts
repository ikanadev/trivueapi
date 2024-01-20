import { Elysia } from "elysia";
import { setupDb, migrateSchema } from '@/db';

/*
const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
*/

async function main() {
  await migrateSchema();
}

main();

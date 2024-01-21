import { Elysia, t } from "elysia";
import { setupDb } from "@/db";
import { config } from "@/utils";
import { setupTrivueApp } from "@/apps/trivue";

const db = setupDb();

const app = new Elysia();
app.group("/trivue", (app) => setupTrivueApp(app, db));

app.get("/health", () => "Working!");

app.listen({ port: config.port }, () => {
	console.log(`🦊 Running at ${app.server?.hostname}:${app.server?.port}`);
});

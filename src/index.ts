import { Elysia } from "elysia";
import { setupDb } from "@/db";
import { config, AppDecorators } from "@/utils";
import { setupTrivueApp } from "@/apps/trivue";

const db = setupDb();

const app = new Elysia<"", AppDecorators>();

app.use((innerApp) => {
	return innerApp.derive(({ request }) => {
		const ipInfo = innerApp.server?.requestIP(request);
		return {
			ip: ipInfo?.address,
		};
	});
});

app.group("/trivue", (app) => setupTrivueApp(app, db));

app.get("/health", () => "Working!");

app.listen({ port: config.port }, () => {
	console.log(`🦊 Running at ${app.server?.hostname}:${app.server?.port}`);
});

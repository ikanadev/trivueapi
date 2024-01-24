import Fastify from "fastify";
import { config } from "./utils";
import { setupDb } from "./db";
import { RootServer } from "./types";
import { trivueApp } from "./apps/trivue";

const db = setupDb();

const app: RootServer = Fastify({ logger: true });
app.decorate("db", db);

app.register(trivueApp, { prefix: "/trivue" });

app.get("/health", async (_, res) => {
	res.send({ status: "running" });
});

async function start() {
	try {
		await app.listen({ port: parseInt(config.port) });
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
}

start();

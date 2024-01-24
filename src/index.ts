import Fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { AppError } from "./appError";
import { trivueApp } from "./apps/trivue";
import { setupDb } from "./db";
import { RootServer } from "./types";
import { config } from "./utils";

const db = setupDb();

const app: RootServer = Fastify({ logger: !config.isProd });
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.decorate("db", db);

app.register(trivueApp, { prefix: "/trivue" });

app.get("/health", async (_, res) => {
	res.send({ status: "running" });
});

app.setErrorHandler((err, _, res) => {
	if (err instanceof AppError) {
		res.status(err.code).send({ message: err.message });
	}
	// TODO: Log error details
	if (config.isProd) {
		res.status(500).send({
			message:
				"Woops, An unexpected error happened. Sorry for the inconvenience",
		});
	} else {
		res.status(500).send(err);
	}
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

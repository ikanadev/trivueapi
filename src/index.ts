import Fastify from "fastify";
import { config } from "./utils";
import { setupDb } from "./db";

const db = setupDb();

const app = Fastify({ logger: true });
app.decorate("db", db);

app.register(async (childApp) => {
	childApp.decorate("id", 5);
	childApp.get("/", async function(req, res) {
		console.log(this.db);
		res.send({});
	});
});

app.get("/", async function (req, res) {
	console.log(this.db);
	res.send({ hello: "worlds xd xd" });
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

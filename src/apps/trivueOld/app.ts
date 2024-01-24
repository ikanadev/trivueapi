import { Elysia } from "elysia";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { saveQuestion, getQuestions, saveVote } from "@trivue/handlers";

export function setupTrivueApp(
	app: Elysia<"/trivue", AppDecorators>,
	db: PostgresJsDatabase,
) {
	saveQuestion(app, db);
	getQuestions(app, db);
	saveVote(app, db);
	return app;
}

export async function trivueApp(childApp) {
	childApp.decorate("id", 5);
	childApp.get("/", async function(req, res) {
		console.log(this.db);
		res.send({});
	});
}

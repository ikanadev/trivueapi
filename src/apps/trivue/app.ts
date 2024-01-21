import { Elysia } from "elysia";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { saveQuestion, getQuestions } from "@trivue/handlers";

export function setupTrivueApp(app: Elysia<"/trivue">, db: PostgresJsDatabase) {
	saveQuestion(app, db);
	getQuestions(app, db);
	return app;
}

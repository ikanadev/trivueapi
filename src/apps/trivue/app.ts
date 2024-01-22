import { Elysia } from "elysia";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { saveQuestion, getQuestions } from "@trivue/handlers";
import { AppDecorators } from "@/utils";

export function setupTrivueApp(
	app: Elysia<"/trivue", AppDecorators>,
	db: PostgresJsDatabase,
) {
	saveQuestion(app, db);
	getQuestions(app, db);
	return app;
}

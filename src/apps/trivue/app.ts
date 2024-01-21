import { nanoid } from "nanoid";
import { Elysia, t } from "elysia";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { Level } from "./utils";
import { authors, Author, questions, ChoiceInsert, choices } from "./schema";

export function setupTrivueApp(app: Elysia<"/trivue">, db: PostgresJsDatabase) {
	app.post(
		"/questions",
		async ({ body }) => {
			let author: Author | null = null;
			if (body.author) {
				const dbAuthors = await db
					.select()
					.from(authors)
					.where(eq(authors.url, body.author.url));
				if (dbAuthors.length > 0) {
					author = dbAuthors[0];
				} else {
					const result = await db
						.insert(authors)
						.values({
							id: nanoid(),
							url: body.author.url,
							name: body.author.name,
						})
						.returning();
					author = result[0];
				}
			}
			const saveResult = await db
				.insert(questions)
				.values({
					id: nanoid(),
					text: body.text,
					authorId: author?.id,
					seconds: body.seconds,
					explanation: body.explanation,
					level: body.level,
				})
				.returning();
			const question = saveResult[0];
			const choicesToSave: ChoiceInsert[] = body.choices.map((c) => ({
				id: nanoid(),
				text: c.text,
				isCorrect: c.isCorrect,
				questionId: question.id,
			}));
			await db.insert(choices).values(choicesToSave);
			return "{}";
		},
		{
			body: t.Object({
				text: t.String(),
				seconds: t.Number(),
				explanation: t.Optional(t.String()),
				level: t.Enum(Level),
				choices: t.Array(
					t.Object({
						text: t.String(),
						isCorrect: t.Boolean(),
					}),
				),
				author: t.Optional(
					t.Object({
						url: t.String(),
						name: t.String(),
					}),
				),
			}),
		},
	);
	return app;
}

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { RootServer } from "../../../utils";
import { Author, ChoiceInsert, authors, choices, questions } from "../schema";
import { Level } from "../types";

const body = z.object({
	text: z.string(),
	seconds: z.number(),
	explanation: z.optional(z.string()),
	level: z.nativeEnum(Level),
	choices: z.array(
		z.object({
			text: z.string(),
			isCorrect: z.boolean(),
		}),
	),
	author: z.optional(
		z.object({
			url: z.string(),
			name: z.string(),
		}),
	),
});

export async function saveQuestion(app: RootServer) {
	app.post(
		"/questions",
		{
			schema: { body: body },
		},
		async function(req, res) {
			const { body, ip } = req;
			let author: Author | null = null;
			if (body.author) {
				const dbAuthors = await this.db
					.select()
					.from(authors)
					.where(eq(authors.url, body.author.url));
				if (dbAuthors.length > 0) {
					author = dbAuthors[0];
				} else {
					const result = await this.db
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
			const saveResult = await this.db
				.insert(questions)
				.values({
					id: nanoid(),
					ip,
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
			await this.db.insert(choices).values(choicesToSave);
			res.send({ message: "Question created!" });
		},
	);
}

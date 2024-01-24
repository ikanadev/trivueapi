import { Type } from "@sinclair/typebox";
import { nanoid } from "nanoid";
import { RootServer } from "../../../types";
import { Level } from "../types";
import { Author, ChoiceInsert, authors, choices, questions } from "../schema";
import { eq } from "drizzle-orm";

const body = Type.Object({
	text: Type.String(),
	seconds: Type.Number(),
	explanation: Type.Optional(Type.String()),
	level: Type.Enum(Level),
	choices: Type.Array(
		Type.Object({
			text: Type.String(),
			isCorrect: Type.Boolean(),
		}),
	),
	author: Type.Optional(
		Type.Object({
			url: Type.String(),
			name: Type.String(),
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

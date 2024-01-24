import {
	Author,
	Choice,
	Question,
	authors,
	choices,
	questions,
} from "@trivue/schema";
import { Level } from "@trivue/types";
import { eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import Elysia, { t } from "elysia";

type QuestionItem = Omit<Question, "authorId" | "level"> & {
	author: Author | null;
	choices: Omit<Choice, "questionId">[];
};

export async function getQuestions(
	app: Elysia<"/trivue">,
	db: PostgresJsDatabase,
) {
	app.get(
		"/questions",
		async ({ query, request }) => {
			console.log(request.headers);
			console.log(app.server?.requestIP(request));
			const results = await db
				.select({
					question: questions,
					author: authors,
					choice: choices,
				})
				.from(questions)
				.where(eq(questions.level, query.level))
				.leftJoin(authors, eq(questions.authorId, authors.id))
				.innerJoin(choices, eq(choices.questionId, questions.id));

			const dataMap = results.reduce<Record<string, QuestionItem>>(
				(acc, res) => {
					if (!acc[res.question.id]) {
						acc[res.question.id] = {
							id: res.question.id,
							text: res.question.text,
							seconds: res.question.seconds,
							explanation: res.question.explanation,
							author: res.author,
							choices: [],
						};
					}
					acc[res.question.id].choices.push({
						id: res.choice.id,
						text: res.choice.text,
						isCorrect: res.choice.isCorrect,
					});
					return acc;
				},
				{},
			);

			return Object.values(dataMap);
		},
		{
			query: t.Object({
				level: t.Enum(Level),
			}),
		},
	);
}

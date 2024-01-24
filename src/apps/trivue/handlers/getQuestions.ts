import { Type } from "@sinclair/typebox";
import { RootServer } from "../../../types";
import { Level } from "../types";
import {
	Author,
	Choice,
	Question,
	authors,
	choices,
	questions,
} from "../schema";
import { eq } from "drizzle-orm";

type QuestionItem = Omit<Question, "authorId" | "level"> & {
	author: Author | null;
	choices: Omit<Choice, "questionId">[];
};

const queryString = Type.Object({
	level: Type.Enum(Level),
});

export async function getQuestions(app: RootServer) {
	app.get(
		"/questions",
		{
			schema: {
				querystring: queryString,
			},
		},
		async function (req, res) {
			const query = req.query;
			console.log(req.ip);
			const results = await this.db
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
							createdAt: res.question.createdAt,
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

			res.send(Object.values(dataMap));
		},
	);
}

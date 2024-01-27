import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { AppError, HttpStatusCode, RootServer } from "../../../utils";
import { authors, choices, questions, votes } from "../schema";
import { Level, QuestionVotes, VoteType } from "../types";

const params = z.object({
	id: z.string(),
});

const response = z.object({
	id: z.string(),
	text: z.string(),
	seconds: z.number().positive(),
	level: z.nativeEnum(Level),
	explanation: z.nullable(z.string()),
	createdAt: z.date(),
	author: z.nullable(
		z.object({
			url: z.string(),
			name: z.string(),
		}),
	),
	votes: z.object({
		positive: z.number(),
		negative: z.number(),
	}),
	choices: z.array(
		z.object({
			id: z.string(),
			text: z.string(),
			isCorrect: z.boolean(),
		}),
	),
});

export async function questionDetails(app: RootServer) {
	app.get(
		"/questions/:id",
		{ schema: { params, response: { 200: response } } },
		async function(req, res) {
			const questionId = req.params.id;
			let questionVotes: QuestionVotes = { positive: 0, negative: 0 };
			const dbQuestionVotes = await this.db
				.select({
					positive:
						sql<number>`COALESCE(SUM(CASE WHEN ${votes.type} = ${VoteType.positive} THEN 1 END), 0)::int`.as(
							"positive",
						),
					negative:
						sql<number>`COALESCE(SUM(CASE WHEN ${votes.type} = ${VoteType.negative} THEN 1 END), 0)::int`.as(
							"negative",
						),
				})
				.from(votes)
				.where(eq(votes.questionId, questionId));
			if (dbQuestionVotes.length > 0) {
				questionVotes = dbQuestionVotes[0];
			}
			const dbQuestions = await this.db
				.select()
				.from(questions)
				.where(eq(questions.id, questionId))
				.leftJoin(authors, eq(authors.id, questions.authorId));
			if (dbQuestions.length === 0) {
				throw new AppError(HttpStatusCode.NOT_FOUND, "Question not found!");
			}
			const dbQuestion = dbQuestions[0].questions;
			const questionChoices = await this.db
				.select()
				.from(choices)
				.where(eq(choices.questionId, questionId));

			const response = {
				...dbQuestion,
				level: dbQuestion.level as Level,
				author: dbQuestions[0].authors,
				choices: questionChoices,
				votes: questionVotes,
			};
			res.send(response);
		},
	);
}

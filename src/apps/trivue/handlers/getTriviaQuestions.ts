import { eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { AppError } from "../../../appError";
import { RootServer } from "../../../types";
import { HttpStatusCode } from "../../../utils";
import {
	Author,
	Choice,
	Question,
	authors,
	choices,
	questions,
	votes,
} from "../schema";
import { Level, VoteType } from "../types";

// TODO: change these values. maxQuestions = 10, voteDifference = 10;
const voteDifference = 1;
const maxQuestions = 2;

type QuestionItem = Omit<Question, "authorId" | "level" | "ip"> & {
	author: Author | null;
	choices: Omit<Choice, "questionId">[];
	votes: {
		positive: number;
		negative: number;
	};
};

const queryString = z.object({
	level: z.nativeEnum(Level),
});

export async function getTriviaQuestions(app: RootServer) {
	app.get(
		"/questions/trivia",
		{
			schema: {
				querystring: queryString,
			},
		},
		async function(req, res) {
			const query = req.query;

			const votesQuery = this.db
				.select({
					questionId: votes.questionId,
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
				.having(
					(fields) =>
						sql`${fields.positive} - ${fields.negative} >= ${voteDifference}`,
				)
				.groupBy(votes.questionId)
				.as("votesQuery");

			const dbQuestions = await this.db
				.with(votesQuery)
				.select()
				.from(questions)
				.where(eq(questions.level, query.level))
				.innerJoin(votesQuery, eq(questions.id, votesQuery.questionId))
				.leftJoin(authors, eq(questions.authorId, authors.id))
				.orderBy(sql`RANDOM()`)
				.limit(maxQuestions);

			if (dbQuestions.length < maxQuestions) {
				throw new AppError(
					HttpStatusCode.UNPROCESSABLE_ENTITY,
					`Sorry, at least 10 ${query.level
					} questions with ${voteDifference} positive points are required. Currently, only ${dbQuestions.length
					} ${dbQuestions.length === 1 ? "question meets" : "questions meet"
					} this condition. You can help by posting questions or rating them.`,
				);
			}

			const dbQuestionIds = dbQuestions.map((q) => q.questions.id);
			const dbChoices = await this.db
				.select()
				.from(choices)
				.where(inArray(choices.questionId, dbQuestionIds));

			const result: Array<QuestionItem> = [];
			for (const q of dbQuestions) {
				const item: QuestionItem = {
					id: q.questions.id,
					text: q.questions.text,
					explanation: q.questions.explanation,
					seconds: q.questions.seconds,
					createdAt: q.questions.createdAt,
					author: q.authors,
					votes: q.votesQuery,
					choices: [],
				};
				item.choices = dbChoices
					.filter((c) => c.questionId === item.id)
					.map((c) => ({ id: c.id, text: c.text, isCorrect: c.isCorrect }));
				result.push(item);
			}
			res.send(result);
		},
	);
}

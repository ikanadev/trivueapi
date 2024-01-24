import { Type } from "@sinclair/typebox";
import { eq, sql, inArray } from "drizzle-orm";
import { RootServer } from "../../../types";
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

const voteDifference = 1;

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
		async function(req, res) {
			const query = req.query;
			const votesQuery = this.db
				.select({
					questionId: votes.questionId,
					positive: sql<number>`COALESCE(SUM(CASE WHEN ${votes.type} = ${VoteType.positive} THEN 1 END), 0)::int`.as('positive'),
					negative: sql<number>`COALESCE(SUM(CASE WHEN ${votes.type} = ${VoteType.negative} THEN 1 END), 0)::int`.as('negative'),
				})
				.from(votes)
				.having(
					(fields) =>
						sql`${fields.positive} - ${fields.negative} >= ${voteDifference}`,
				)
				.groupBy(votes.questionId)
				.as("votesQuery");
			const dbQuestions = this.db
				.with(votesQuery)
				.select()
				.from(questions)
				.innerJoin(votesQuery, eq(questions.id, votesQuery.questionId));
			console.log(dbQuestions.toSQL());
			const dbVotes = await dbQuestions;
			res.send(dbVotes);
			return;
			const dbQuery = this.db
				.select({
					question: questions,
					author: authors,
					choice: choices,
				})
				.from(questions)
				.where(eq(questions.level, query.level))
				.leftJoin(authors, eq(questions.authorId, authors.id))
				.innerJoin(choices, eq(choices.questionId, questions.id));

			console.log("QUERY:", dbQuery.toSQL());
			const results = await dbQuery;

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

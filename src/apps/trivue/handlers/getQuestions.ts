import {
	AnyColumn,
	SQLWrapper,
	asc,
	count,
	desc,
	eq,
	inArray,
	sql,
} from "drizzle-orm";
import { z } from "zod";
import { RootServer } from "../../../utils";
import { questions, votes } from "../schema";
import { Level, VoteType } from "../types";

enum SortOrder {
	asc = "asc",
	desc = "desc",
}
enum SortType {
	date = "date",
	votes = "votes",
	duration = "duration",
}

type QuestionVotes = {
	positive: number;
	negative: number;
};

type QuestionItem = {
	id: string;
	text: string;
	level: Level;
	createdAt: Date;
	votes: QuestionVotes;
};

const querystring = z.object({
	page: z.number({ coerce: true }).positive(),
	size: z.number({ coerce: true }).positive(),
	sort: z.nativeEnum(SortType),
	order: z.nativeEnum(SortOrder),
	level: z.optional(z.nativeEnum(Level)),
});

const response = z.object({
	total: z.number(),
	questions: z.array(
		z.object({
			id: z.string(),
			text: z.string(),
			level: z.nativeEnum(Level),
			createdAt: z.date(),
			votes: z.object({
				positive: z.number(),
				negative: z.number(),
			}),
		}),
	),
});

export async function getQuestions(app: RootServer) {
	app.get(
		"/questions",
		{ schema: { querystring, response: { 200: response } } },
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
				.groupBy(votes.questionId)
				.as("votesQuery");

			let orderDir = asc;
			if (query.order === SortOrder.desc) {
				orderDir = desc;
			}

			let orderField: AnyColumn | SQLWrapper = questions.createdAt;
			switch (query.sort) {
				case SortType.date:
					break;
				case SortType.votes:
					orderField = sql<number>`(${votesQuery.positive} - ${votesQuery.negative})`;
					break;
				case SortType.duration:
					orderField = questions.seconds;
					break;
			}

			let levels = [Level.basic, Level.medium, Level.expert];
			switch (query.level) {
				case Level.basic:
					levels = [Level.basic];
					break;
				case Level.medium:
					levels = [Level.medium];
					break;
				case Level.expert:
					levels = [Level.expert];
					break;
			}

			const dbTotalQuestions = await this.db
				.select({ total: count() })
				.from(questions)
				.where(inArray(questions.level, levels));
			const total = dbTotalQuestions[0].total;

			const dbQuestions = await this.db
				.with(votesQuery)
				.select()
				.from(questions)
				.where(inArray(questions.level, levels))
				.leftJoin(votesQuery, eq(questions.id, votesQuery.questionId))
				.orderBy(orderDir(orderField))
				.limit(query.size)
				.offset(query.size * (query.page - 1));

			const responseQuestions: Array<QuestionItem> = [];
			for (const dbQuestion of dbQuestions) {
				const item: QuestionItem = {
					...dbQuestion.questions,
					level: dbQuestion.questions.level as Level,
					votes: { positive: 0, negative: 0 },
				};
				if (dbQuestion.votesQuery) {
					item.votes = dbQuestion.votesQuery;
				}
				responseQuestions.push(item);
			}
			res.send({ total, questions: responseQuestions });
		},
	);
}

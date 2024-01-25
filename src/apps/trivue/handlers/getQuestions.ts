import {
	AnyColumn,
	SQLWrapper,
	asc,
	desc,
	eq,
	inArray,
	sql,
} from "drizzle-orm";
import { z } from "zod";
import { RootServer } from "../../../utils";
import { questions, votes } from "../schema";
import { Level, VoteType } from "../types";

enum SortDir {
	asc = "asc",
	desc = "desc",
}
enum SortType {
	date = "date",
	votes = "votes",
	duration = "duration",
}

const querystring = z.object({
	page: z.number().positive(),
	size: z.number().positive(),
	sort: z.nativeEnum(SortType),
	dir: z.nativeEnum(SortDir),
	level: z.optional(z.nativeEnum(Level)),
});

export async function getQuestions(app: RootServer) {
	app.get("/questions", { schema: { querystring } }, async function(req, res) {
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
		if (query.dir === SortDir.desc) {
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

		const dbQuestions = await this.db
			.with(votesQuery)
			.select()
			.from(questions)
			.where(inArray(questions.level, levels))
			.leftJoin(votesQuery, eq(questions.id, votesQuery.questionId))
			.orderBy(orderDir(orderField))
			.limit(query.size)
			.offset(query.size * query.page);
		res.send(dbQuestions);
	});
}

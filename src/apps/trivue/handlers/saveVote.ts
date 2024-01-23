import { AppDecorators } from '@/utils';
import { questions, votes } from "@trivue/schema";
import { VoteType } from "@trivue/types";
import { eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import Elysia, { t } from "elysia";

export function saveVote(app: Elysia<"/trivue", AppDecorators>, db: PostgresJsDatabase) {
	app.post(
		"/questions/:id/vote",
		async ({ params, body, ip }) => {
			console.log("IP: ", ip);
			const result = await db
				.select()
				.from(questions)
				.where(eq(questions.id, params.id));
			if (result.length === 0) {
				throw Error('Question does not exists');
			}
			if (ip === null) {
				throw Error('Error obtaining IP (is required to prevent spam)');
			}
			const question = result[0];
			const vote = await db.insert(votes).values({
				questionId: question.id,
				type: body.vote,
				ip: ip,
			}).returning();
			return vote;
		},
		{
			body: t.Object({
				vote: t.Enum(VoteType),
			}),
		},
	);
}

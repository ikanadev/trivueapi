import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
	AppError,
	HttpStatusCode,
	RootServer,
	appMessage,
} from "../../../utils";
import { questions, votes } from "../schema";
import { VoteType } from "../types";

const params = z.object({
	id: z.string(),
});

const body = z.object({
	vote: z.nativeEnum(VoteType),
});

export async function voteQuestion(app: RootServer) {
	app.post(
		"/questions/:id/vote",
		{
			schema: {
				params: params,
				body: body,
			},
		},
		async function(req, res) {
			const { params, body, ip } = req;

			const dbItems = await this.db
				.select()
				.from(questions)
				.where(eq(questions.id, params.id));

			if (dbItems.length === 0) {
				throw Error("Question not found");
			}
			if (ip === null || ip.length === 0) {
				throw new AppError(
					HttpStatusCode.BAD_REQUEST,
					"Can not identify your request",
				);
			}

			const dbQuestion = dbItems[0];
			const dbVotes = await this.db
				.select()
				.from(votes)
				.where(and(eq(votes.ip, ip), eq(votes.questionId, dbQuestion.id)));
			if (dbVotes.length > 0) {
				throw new AppError(
					HttpStatusCode.CONFLICT,
					"Seems like you already voted for this question",
				);
			}
			await this.db.insert(votes).values({
				ip,
				questionId: dbQuestion.id,
				type: body.vote,
			});
			res.send(appMessage("Vote saved!"));
		},
	);
}

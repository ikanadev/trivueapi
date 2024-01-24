import { Type } from "@sinclair/typebox";
import { RootServer } from "../../../types";
import { questions, votes } from "../schema";
import { and, eq } from "drizzle-orm";
import { VoteType } from "../types";

const params = Type.Object({
	id: Type.String(),
});

const body = Type.Object({
	vote: Type.Enum(VoteType),
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
		async function (req, res) {
			const { params, body } = req;
			const ip = req.ip;

			const dbItems = await this.db
				.select()
				.from(questions)
				.where(eq(questions.id, params.id));
			console.log("QUESTIONS: ", dbItems);
			if (dbItems.length === 0) {
				throw Error("Question not found");
			}
			if (ip === null || ip.length === 0) {
				throw Error("Can not identify your request");
			}

			const dbQuestion = dbItems[0];
			const dbVotes = await this.db
				.select()
				.from(votes)
				.where(and(eq(votes.ip, ip), eq(votes.questionId, dbQuestion.id)));
			if (dbVotes.length > 0) {
				throw Error("Seems like you already voted for this question");
			}
			await this.db.insert(votes).values({
				ip,
				questionId: dbQuestion.id,
				type: body.vote,
			});
			console.log(typeof this);
			res.send({ params: req.params });
		},
	);
}

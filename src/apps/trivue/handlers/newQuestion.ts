import { Type } from "@sinclair/typebox";
import { RootServer } from "../../../types";
import { Level } from "../types";

const Body = Type.Object({
	text: Type.String(),
	seconds: Type.Number(),
	explanation: Type.Optional(Type.String()),
	level: Type.Enum(Level),
	choices: Type.Array(
		Type.Object({
			text: Type.String(),
			isCorrect: Type.Boolean(),
		}),
	),
	author: Type.Optional(
		Type.Object({
			url: Type.String(),
			name: Type.String(),
		}),
	),
});

export async function newQuestion(app: RootServer) {
	app.post(
		"/questions",
		{
			schema: {
				body: Body,
			},
		},
		(req, res) => {
			const xd = req.body;
			console.log(req.body);
			res.send({ ok: "ok" });
		},
	);
}

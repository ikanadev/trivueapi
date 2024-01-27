import { RootServer } from "../../utils";
import * as handlers from "./handlers";

export async function trivueApp(app: RootServer) {
	await handlers.saveQuestion(app);
	await handlers.getTriviaQuestions(app);
	await handlers.getQuestions(app);
	await handlers.voteQuestion(app);
	await handlers.questionDetails(app);
}

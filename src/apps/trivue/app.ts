import { RootServer } from "../../types";
import { getTriviaQuestions, saveQuestion, voteQuestion } from "./handlers";

export async function trivueApp(app: RootServer) {
	await saveQuestion(app);
	await getTriviaQuestions(app);
	await voteQuestion(app);
}

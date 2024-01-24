import { RootServer } from "../../types";
import { getQuestions, saveQuestion, voteQuestion } from "./handlers";

export async function trivueApp(app: RootServer) {
	await saveQuestion(app);
	await getQuestions(app);
	await voteQuestion(app);
}

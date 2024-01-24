import { saveQuestion, getQuestions, voteQuestion } from "./handlers";
import { RootServer } from "../../types";

export async function trivueApp(app: RootServer) {
	await saveQuestion(app);
	await getQuestions(app);
	await voteQuestion(app);
}

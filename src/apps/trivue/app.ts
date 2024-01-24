import { saveQuestion, getQuestions } from "./handlers";
import { RootServer } from "../../types";

export async function trivueApp(app: RootServer) {
	await saveQuestion(app);
	await getQuestions(app);
}

import { newQuestion } from "./handlers/newQuestion";
import { RootServer } from "../../types";

export async function trivueApp(app: RootServer) {
	await newQuestion(app);
}

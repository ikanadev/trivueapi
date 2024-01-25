import { AppMessage } from "./types";

export function appMessage(message: string): AppMessage {
	return { message };
}

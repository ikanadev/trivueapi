export class AppError extends Error {
	code: number;
	constructor(code: number, message: string) {
		super(message);
		this.code = code;
	}
}

export function isAppError(err: Error) {
	return err instanceof AppError;
}

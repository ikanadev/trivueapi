import { IncomingMessage, Server, ServerResponse } from "http";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { FastifyBaseLogger, FastifyInstance } from "fastify";

declare module "fastify" {
	interface FastifyInstance {
		db: PostgresJsDatabase;
	}
}

export type RootServer = FastifyInstance<
	Server<typeof IncomingMessage, typeof ServerResponse>,
	IncomingMessage,
	ServerResponse<IncomingMessage>,
	FastifyBaseLogger,
	ZodTypeProvider
>;

export type AppMessage = {
	message: string;
};


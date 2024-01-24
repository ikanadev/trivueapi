import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { FastifyBaseLogger, FastifyInstance } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

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
	TypeBoxTypeProvider
>;


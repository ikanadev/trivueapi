import fastify from 'fastify';

declare module "fastify" {
	interface FastifyInstance {
		db: typeof db;
	}
}

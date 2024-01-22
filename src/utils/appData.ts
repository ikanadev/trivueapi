import { DecoratorBase } from "elysia";

export type AppDecorators = DecoratorBase & {derive: {ip: string | null}};

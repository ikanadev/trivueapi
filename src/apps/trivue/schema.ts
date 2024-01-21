import { boolean, integer, pgSchema, text, varchar } from "drizzle-orm/pg-core";
import { trivueDbSchema } from './constants';

export const trivueSchema = pgSchema(trivueDbSchema);

export const authors = trivueSchema.table("authors", {
  id: varchar("id", { length: 21 }).primaryKey(),
  url: varchar("url", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
});

export type Author = typeof authors.$inferSelect;
export type AuthorInsert = typeof authors.$inferInsert;

export const questions = trivueSchema.table("questions", {
  id: varchar("id", { length: 21 }).primaryKey(),
  authorId: varchar("author_id", { length: 21 }).references(() => authors.id),
  text: text("text").notNull(),
  seconds: integer("seconds").notNull(),
  explanation: text("explanation"),
  level: varchar("level", { length: 255 }).notNull(),
});

export type Question = typeof questions.$inferSelect;
export type QuestionInsert = typeof questions.$inferInsert;

export const choices = trivueSchema.table("choices", {
  id: varchar("id", { length: 21 }).primaryKey(),
  questionId: varchar("question_id", { length: 21 })
    .references(() => questions.id)
    .notNull(),
  text: text("text").notNull(),
  isCorrect: boolean("is_correct").notNull(),
});

export type Choice = typeof choices.$inferSelect;
export type ChoiceInsert = typeof choices.$inferInsert;

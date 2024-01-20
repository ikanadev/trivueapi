CREATE TABLE IF NOT EXISTS "authors" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"url" varchar(255),
	"name" varchar(255),
	CONSTRAINT "authors_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "choices" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"question_id" varchar(21) NOT NULL,
	"text" text NOT NULL,
	"is_correct" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"author_id" varchar(21),
	"text" text NOT NULL,
	"seconds" integer NOT NULL,
	"explanation" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "choices" ADD CONSTRAINT "choices_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

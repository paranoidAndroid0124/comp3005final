CREATE TABLE IF NOT EXISTS "student" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"enrollment_date" date,
	CONSTRAINT "student_email_unique" UNIQUE("email")
);

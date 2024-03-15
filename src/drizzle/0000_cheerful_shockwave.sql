CREATE TABLE IF NOT EXISTS "adminStaff" (
	"staff_id" serial NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	CONSTRAINT "adminStaff_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billingInformation" (
	"billing_id" serial PRIMARY KEY NOT NULL,
	"periodicity" text NOT NULL,
	"paymentInfo" text NOT NULL,
	"cardType" text,
	"cardHolder" text NOT NULL,
	"cardNumber" text NOT NULL,
	"expiry" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "equipment" (
	"equipment_id" serial PRIMARY KEY NOT NULL,
	"equipment_name" text,
	"last_maintained" date NOT NULL,
	"next_maintained" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exercise" (
	"exercise" text PRIMARY KEY NOT NULL,
	"reps" integer,
	"duration" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "member" (
	"member_id" serial PRIMARY KEY NOT NULL,
	"billing_id" integer,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"address" text,
	"health_metrix" text,
	"fitness_goals" text,
	"fitness_achivements" text,
	"join_date" date,
	"email" text,
	"password" text,
	"phone_number" text,
	CONSTRAINT "member_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "membershipCard" (
	"member_id" integer,
	"nfc" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "paymentInfo" (
	"payment_id" serial PRIMARY KEY NOT NULL,
	"member_id" integer,
	"payment_date" date,
	"amount" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room" (
	"room_id" serial PRIMARY KEY NOT NULL,
	"trainer_Id" integer,
	"capacity" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trainer" (
	"trainer_id" integer PRIMARY KEY NOT NULL,
	"name" text,
	"address" text,
	"phone_number" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member" ADD CONSTRAINT "member_billing_id_billingInformation_billing_id_fk" FOREIGN KEY ("billing_id") REFERENCES "billingInformation"("billing_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "membershipCard" ADD CONSTRAINT "membershipCard_member_id_member_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "member"("member_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "paymentInfo" ADD CONSTRAINT "paymentInfo_member_id_member_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "member"("member_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

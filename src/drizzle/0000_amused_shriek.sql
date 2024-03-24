CREATE TABLE IF NOT EXISTS "adminStaff" (
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billingInformation" (
	"billing_id" serial PRIMARY KEY NOT NULL,
	"member_id" integer,
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
	"member_id" integer,
	"health_metrix" text,
	"fitness_goals" text,
	"fitness_achivements" text,
	"join_date" date
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
CREATE TABLE IF NOT EXISTS "roles" (
	"role_id" serial PRIMARY KEY NOT NULL,
	"role_name" text NOT NULL,
	CONSTRAINT "roles_role_name_unique" UNIQUE("role_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "room" (
	"room_id" serial PRIMARY KEY NOT NULL,
	"trainer_Id" integer,
	"capacity" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trainer" (
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userRoles" (
	"user_id" integer,
	"role_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"phone_number" text,
	"address" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "adminStaff" ADD CONSTRAINT "adminStaff_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billingInformation" ADD CONSTRAINT "billingInformation_member_id_member_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "member"("member_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member" ADD CONSTRAINT "member_member_id_users_user_id_fk" FOREIGN KEY ("member_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trainer" ADD CONSTRAINT "trainer_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userRoles" ADD CONSTRAINT "userRoles_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userRoles" ADD CONSTRAINT "userRoles_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

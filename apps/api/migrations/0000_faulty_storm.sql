CREATE TABLE "tabs" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"data" jsonb,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"user_id" text NOT NULL,
	"after_id" integer,
	"is_active" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"inserted_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"name" text,
	"type" text
);

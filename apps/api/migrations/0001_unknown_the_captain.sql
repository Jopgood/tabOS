ALTER TABLE "todos" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "todos" CASCADE;--> statement-breakpoint
ALTER TABLE "tabs" RENAME COLUMN "name" TO "title";--> statement-breakpoint
ALTER TABLE "tabs" RENAME COLUMN "data" TO "content";--> statement-breakpoint
ALTER TABLE "tabs" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "tabs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "tabs" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "tabs" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tabs" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tabs" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "tabs" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tabs" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tabs" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "tabs" ALTER COLUMN "after_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "tabs" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "tabs" DROP COLUMN "is_active";
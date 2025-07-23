ALTER TABLE "tabs" RENAME COLUMN "after_id" TO "position";--> statement-breakpoint
ALTER TABLE "tabs" ALTER COLUMN "type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tabs" DROP COLUMN "content";--> statement-breakpoint
ALTER TABLE "tabs" DROP COLUMN "is_active";
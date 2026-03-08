ALTER TABLE "cars" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE'::text;--> statement-breakpoint
UPDATE "cars" SET "status" = 'AVAILABLE' WHERE "status" = 'RENTED';--> statement-breakpoint
DROP TYPE "public"."car_status";--> statement-breakpoint
CREATE TYPE "public"."car_status" AS ENUM('AVAILABLE', 'MAINTENANCE', 'UNAVAILABLE');--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE'::"public"."car_status";--> statement-breakpoint
ALTER TABLE "cars" ALTER COLUMN "status" SET DATA TYPE "public"."car_status" USING "status"::"public"."car_status";--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "rental_events" ADD COLUMN "mileage_km" integer;--> statement-breakpoint
CREATE INDEX "cars_status_idx" ON "cars" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoices_issued_at_idx" ON "invoices" USING btree ("issued_at");--> statement-breakpoint
CREATE INDEX "rental_events_rental_timestamp_idx" ON "rental_events" USING btree ("rental_id","timestamp");--> statement-breakpoint
CREATE INDEX "rentals_car_status_idx" ON "rentals" USING btree ("car_id","status");--> statement-breakpoint
CREATE INDEX "rentals_user_created_idx" ON "rentals" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "rentals_agent_created_idx" ON "rentals" USING btree ("agent_id","created_at");--> statement-breakpoint
CREATE INDEX "rentals_status_created_idx" ON "rentals" USING btree ("status","created_at");--> statement-breakpoint
ALTER TABLE "cars" DROP COLUMN "is_available";--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_rental_id_unique" UNIQUE("rental_id");
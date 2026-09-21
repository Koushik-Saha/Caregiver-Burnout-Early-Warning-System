CREATE TYPE "public"."alert_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."call_status" AS ENUM('scheduled', 'in_progress', 'completed', 'failed', 'cancelled', 'no_answer', 'busy', 'voicemail');--> statement-breakpoint
CREATE TYPE "public"."checkin_status" AS ENUM('pending', 'completed', 'missed');--> statement-breakpoint
CREATE TYPE "public"."circle_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."consent_status" AS ENUM('pending', 'granted', 'declined', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."report_alert_level" AS ENUM('green', 'amber', 'red');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('primary_caregiver', 'family_member', 'professional_caregiver', 'admin');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"details" json DEFAULT '{}'::json,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "burnout_alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"circle_id" text,
	"user_id" text,
	"senior_id" text,
	"severity" "alert_severity" DEFAULT 'medium',
	"message" text NOT NULL,
	"is_resolved" boolean DEFAULT false,
	"acknowledged_by_id" text,
	"acknowledged_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "call_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"senior_id" text NOT NULL,
	"circle_id" text NOT NULL,
	"twilio_call_sid" text,
	"status" "call_status" DEFAULT 'scheduled',
	"outcome" text,
	"duration_seconds" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_circles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "care_circles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "caregiver_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"relationship" text,
	"first_name" text,
	"weekly_hours" integer,
	"timezone" text DEFAULT 'America/Chicago',
	"onboarding_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "caregiver_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "checkins" (
	"id" text PRIMARY KEY NOT NULL,
	"circle_id" text,
	"user_id" text NOT NULL,
	"senior_id" text,
	"local_date" text NOT NULL,
	"mood" integer NOT NULL,
	"stress" integer NOT NULL,
	"sleep_hours" integer NOT NULL,
	"care_hours" integer NOT NULL,
	"personal_time" boolean DEFAULT false NOT NULL,
	"note" text,
	"score" integer NOT NULL,
	"level" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "circle_invites" (
	"id" text PRIMARY KEY NOT NULL,
	"circle_id" text NOT NULL,
	"code" text NOT NULL,
	"created_by_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "circle_invites_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "circle_members" (
	"id" text PRIMARY KEY NOT NULL,
	"circle_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "circle_role" DEFAULT 'member',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "circle_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"circle_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"assigned_to_id" text,
	"status" "task_status" DEFAULT 'pending',
	"due_date" timestamp,
	"created_by_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"senior_id" text NOT NULL,
	"circle_id" text NOT NULL,
	"call_id" text,
	"report_date" text NOT NULL,
	"wellbeing_score" integer NOT NULL,
	"alert_level" "report_alert_level" DEFAULT 'green',
	"flags" json DEFAULT '[]'::json,
	"summary" text,
	"answers" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phq2_responses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"q1_score" integer NOT NULL,
	"q2_score" integer NOT NULL,
	"total_score" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"platform" text DEFAULT 'expo',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "scheduled_calls" (
	"id" text PRIMARY KEY NOT NULL,
	"circle_id" text NOT NULL,
	"senior_id" text NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"next_call_at" timestamp,
	"status" "call_status" DEFAULT 'scheduled',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seniors" (
	"id" text PRIMARY KEY NOT NULL,
	"circle_id" text NOT NULL,
	"name" text NOT NULL,
	"phone_number" text,
	"timezone" text DEFAULT 'America/Chicago',
	"preferred_call_time" text DEFAULT '10:00',
	"call_days" json DEFAULT '["mon","tue","wed","thu","fri","sat","sun"]'::json,
	"consent_status" "consent_status" DEFAULT 'pending',
	"paused_until" timestamp,
	"next_call_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'primary_caregiver',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "burnout_alerts" ADD CONSTRAINT "burnout_alerts_circle_id_care_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."care_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "burnout_alerts" ADD CONSTRAINT "burnout_alerts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "burnout_alerts" ADD CONSTRAINT "burnout_alerts_senior_id_seniors_id_fk" FOREIGN KEY ("senior_id") REFERENCES "public"."seniors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "burnout_alerts" ADD CONSTRAINT "burnout_alerts_acknowledged_by_id_user_id_fk" FOREIGN KEY ("acknowledged_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_senior_id_seniors_id_fk" FOREIGN KEY ("senior_id") REFERENCES "public"."seniors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_circle_id_care_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."care_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caregiver_profiles" ADD CONSTRAINT "caregiver_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_circle_id_care_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."care_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_senior_id_seniors_id_fk" FOREIGN KEY ("senior_id") REFERENCES "public"."seniors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_invites" ADD CONSTRAINT "circle_invites_circle_id_care_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."care_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_invites" ADD CONSTRAINT "circle_invites_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_members" ADD CONSTRAINT "circle_members_circle_id_care_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."care_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_members" ADD CONSTRAINT "circle_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_tasks" ADD CONSTRAINT "circle_tasks_circle_id_care_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."care_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_tasks" ADD CONSTRAINT "circle_tasks_assigned_to_id_user_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_tasks" ADD CONSTRAINT "circle_tasks_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_senior_id_seniors_id_fk" FOREIGN KEY ("senior_id") REFERENCES "public"."seniors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_circle_id_care_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."care_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_call_id_call_logs_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."call_logs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phq2_responses" ADD CONSTRAINT "phq2_responses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_calls" ADD CONSTRAINT "scheduled_calls_circle_id_care_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."care_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_calls" ADD CONSTRAINT "scheduled_calls_senior_id_seniors_id_fk" FOREIGN KEY ("senior_id") REFERENCES "public"."seniors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seniors" ADD CONSTRAINT "seniors_circle_id_care_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."care_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "burnout_alerts_circle_idx" ON "burnout_alerts" USING btree ("circle_id");--> statement-breakpoint
CREATE INDEX "burnout_alerts_user_idx" ON "burnout_alerts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "burnout_alerts_senior_idx" ON "burnout_alerts" USING btree ("senior_id");--> statement-breakpoint
CREATE INDEX "call_logs_senior_idx" ON "call_logs" USING btree ("senior_id");--> statement-breakpoint
CREATE INDEX "call_logs_circle_idx" ON "call_logs" USING btree ("circle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_date_unique_idx" ON "checkins" USING btree ("user_id","local_date");--> statement-breakpoint
CREATE INDEX "checkins_circle_idx" ON "checkins" USING btree ("circle_id");--> statement-breakpoint
CREATE INDEX "checkins_user_idx" ON "checkins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "checkins_senior_idx" ON "checkins" USING btree ("senior_id");--> statement-breakpoint
CREATE INDEX "circle_invites_circle_idx" ON "circle_invites" USING btree ("circle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "circle_user_unique_idx" ON "circle_members" USING btree ("circle_id","user_id");--> statement-breakpoint
CREATE INDEX "circle_members_circle_idx" ON "circle_members" USING btree ("circle_id");--> statement-breakpoint
CREATE INDEX "circle_members_user_idx" ON "circle_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "circle_tasks_circle_idx" ON "circle_tasks" USING btree ("circle_id");--> statement-breakpoint
CREATE INDEX "daily_reports_senior_idx" ON "daily_reports" USING btree ("senior_id");--> statement-breakpoint
CREATE INDEX "daily_reports_circle_idx" ON "daily_reports" USING btree ("circle_id");--> statement-breakpoint
CREATE INDEX "phq2_user_idx" ON "phq2_responses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "push_tokens_user_idx" ON "push_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "scheduled_calls_circle_idx" ON "scheduled_calls" USING btree ("circle_id");--> statement-breakpoint
CREATE INDEX "scheduled_calls_senior_idx" ON "scheduled_calls" USING btree ("senior_id");--> statement-breakpoint
CREATE INDEX "scheduled_calls_next_call_idx" ON "scheduled_calls" USING btree ("next_call_at");--> statement-breakpoint
CREATE INDEX "seniors_circle_idx" ON "seniors" USING btree ("circle_id");--> statement-breakpoint
CREATE INDEX "seniors_next_call_idx" ON "seniors" USING btree ("next_call_at");
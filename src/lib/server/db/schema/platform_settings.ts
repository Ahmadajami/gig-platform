import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const platformSettingsTable = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  onboardingMode: text("onboarding_mode", { enum: ["open_access", "interview_required"] }).notNull().default("open_access"),
  platformFeeRate: numeric("platform_fee_rate", { precision: 10, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPlatformSettingsSchema = createInsertSchema(platformSettingsTable).omit({ id: true, updatedAt: true });
export type InsertPlatformSettings = z.infer<typeof insertPlatformSettingsSchema>;
export type PlatformSettings = typeof platformSettingsTable.$inferSelect;

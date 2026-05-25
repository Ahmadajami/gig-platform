import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  prerequisites: text("prerequisites").notNull().default(""),
  rewardStructure: text("reward_structure", { enum: ["per_subscription", "per_lead"] }).notNull().default("per_subscription"),
  subscriptionPrice: numeric("subscription_price", { precision: 14, scale: 2 }).notNull().default("0"),
  commissionRate: numeric("commission_rate", { precision: 10, scale: 2 }).notNull().default("10"),
  leadBounty: numeric("lead_bounty", { precision: 14, scale: 2 }),
  platformFeeRate: numeric("platform_fee_rate", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

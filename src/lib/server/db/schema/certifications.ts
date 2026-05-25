import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const certificationsTable = pgTable("certifications", {
  id: serial("id").primaryKey(),
  repId: integer("rep_id").notNull(),
  productId: integer("product_id").notNull(),
  status: text("status", { enum: ["active", "pending_interview"] }).notNull().default("active"),
  score: integer("score").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCertificationSchema = createInsertSchema(certificationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCertification = z.infer<typeof insertCertificationSchema>;
export type Certification = typeof certificationsTable.$inferSelect;

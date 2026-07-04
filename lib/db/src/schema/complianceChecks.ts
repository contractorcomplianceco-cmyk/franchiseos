import { pgTable, serial, text, date, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { locations } from "./locations";

export const complianceChecks = pgTable("compliance_checks", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  score: integer("score").notNull(),
  checkedAt: timestamp("checked_at", { withTimezone: true }).defaultNow().notNull(),
  dueDate: date("due_date"),
});

export const insertComplianceCheckSchema = createInsertSchema(complianceChecks).omit({
  id: true,
  checkedAt: true,
});

export type ComplianceCheck = typeof complianceChecks.$inferSelect;
export type InsertComplianceCheck = z.infer<typeof insertComplianceCheckSchema>;

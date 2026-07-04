import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { locations } from "./locations";

export const audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  auditor: text("auditor").notNull(),
  score: integer("score").notNull(),
  notes: text("notes"),
  conductedAt: timestamp("conducted_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertAuditSchema = createInsertSchema(audits).omit({
  id: true,
});

export type Audit = typeof audits.$inferSelect;
export type InsertAudit = z.infer<typeof insertAuditSchema>;

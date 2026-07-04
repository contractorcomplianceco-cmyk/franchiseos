import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { locations } from "./locations";
import { tasks } from "./tasks";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id, {
    onDelete: "set null",
  }),
  taskId: integer("task_id").references(() => tasks.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  content: text("content"),
  objectPath: text("object_path"),
  fileType: text("file_type"),
  fileSize: integer("file_size"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

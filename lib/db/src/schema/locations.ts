import { pgTable, serial, text, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip"),
  ownerName: text("owner_name"),
  status: text("status").notNull().default("active"),
  openedDate: date("opened_date"),
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

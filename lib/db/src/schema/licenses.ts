import { pgTable, serial, text, date, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { locations } from "./locations";

export const licenses = pgTable("licenses", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  issuedDate: date("issued_date"),
  expiryDate: date("expiry_date").notNull(),
});

export const insertLicenseSchema = createInsertSchema(licenses).omit({
  id: true,
});

export type License = typeof licenses.$inferSelect;
export type InsertLicense = z.infer<typeof insertLicenseSchema>;

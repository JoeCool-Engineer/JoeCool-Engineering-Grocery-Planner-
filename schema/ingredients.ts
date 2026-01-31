import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

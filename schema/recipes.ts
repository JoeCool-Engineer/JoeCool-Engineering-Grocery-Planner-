import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  instructions: text("instructions").notNull(),

  // optional classification
  cuisine: varchar("cuisine", { length: 128 }),
  category: varchar("category", { length: 128 }), // e.g., Seafood, Beef

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

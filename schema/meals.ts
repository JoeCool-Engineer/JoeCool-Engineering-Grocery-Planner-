import {
  pgTable,
  serial,
  integer,
  date,
  varchar,
  timestamp,
  text,
} from "drizzle-orm/pg-core";
import { recipes } from "./recipes";

// one recipe added to one day at a time
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),

  clerkUserId: text("clerk_user_id").notNull(),

  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "restrict" }),

  day: date("day").notNull(),
  slot: varchar("slot", { length: 32 }).default("dinner"), // optional
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

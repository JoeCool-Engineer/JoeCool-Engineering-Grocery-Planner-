import {
  pgTable,
  serial,
  integer,
  varchar,
} from "drizzle-orm/pg-core";
import { recipes } from "./recipes";
import { ingredients } from "./ingredients";

// quantity/unit as text keeps things flexible ("1/2", "1-3", '3" piece')
export const recipeIngredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),

  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),

  ingredientId: integer("ingredient_id")
    .notNull()
    .references(() => ingredients.id, { onDelete: "restrict" }),

  quantity: varchar("quantity", { length: 64 }),
  unit: varchar("unit", { length: 64 }),
  prepNote: varchar("prep_note", { length: 256 }), // e.g., "trimmed", "minced"

  optional: integer("optional").default(0).notNull(), // 0/1
  sortOrder: integer("sort_order").default(0).notNull(),
});

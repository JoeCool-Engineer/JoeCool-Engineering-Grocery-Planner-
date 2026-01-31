import {
  pgTable,
  serial,
  integer,
  date,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { ingredients } from "./ingredients";

export const groceryCarts = pgTable("grocery_carts", {
  id: serial("id").primaryKey(),
  start: date("start").notNull(),
  end: date("end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Items can be linked to an ingredient OR be free-text custom items.
export const groceryCartItems = pgTable("grocery_cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id")
    .notNull()
    .references(() => groceryCarts.id, { onDelete: "cascade" }),

  ingredientId: integer("ingredient_id")
    .references(() => ingredients.id, { onDelete: "set null" }),

  customName: varchar("custom_name", { length: 256 }), // for non-ingredient items

  quantity: varchar("quantity", { length: 64 }),
  unit: varchar("unit", { length: 64 }),

  checked: integer("checked").default(0).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

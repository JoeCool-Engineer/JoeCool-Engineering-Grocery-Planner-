import { db } from "../drizzle/db";
import { recipes } from "../schema/recipes";
import { ingredients } from "../schema/ingredients";
import { recipeIngredients } from "../schema/recipe-ingredients";

async function upsertIngredient(name: string, notes?: string) {
  const existing = await db.query.ingredients.findFirst({
    where: (i, { eq }) => eq(i.name, name),
  });
  if (existing) return existing;

  const [row] = await db.insert(ingredients).values({ name, notes }).returning();
  return row;
}

export async function seedRecipes() {
  // --- Sausage & Peppers with Gnocchi --- :contentReference[oaicite:3]{index=3}
  const [sausage] = await db.insert(recipes).values({
    title: "Sausage & Peppers with Gnocchi",
    category: "Pork",
    description: "One-pan roasted gnocchi with spicy Italian sausage and peppers.",
    instructions: [
      "Arrange a rack in the middle of the oven and heat the oven to 400F.",
      "Cut bell peppers into 1-inch chunks and place on a rimmed baking sheet. Add 1 lb potato gnocchi.",
      "Drizzle with 2 tbsp olive oil, season with 1/2 tsp kosher salt and 1/4 tsp black pepper, and toss well to combine. Spread out evenly.",
      "Remove the casings from 1 lb spicy Italian sausages if needed. Drop bite-sized pieces over the gnocchi mixture.",
      "Roast, stirring halfway through, until the gnocchi are plump, the sausage is cooked through, and the peppers are tender, 15 to 20 minutes total.",
      "Garnish with chopped fresh parsley leaves, if desired.",
    ].join("\n"),
  }).returning();

  const bellPeppers = await upsertIngredient("bell peppers");
  const gnocchi = await upsertIngredient("potato gnocchi");
  const oliveOil = await upsertIngredient("olive oil");
  const salt = await upsertIngredient("kosher salt");
  const pepper = await upsertIngredient("freshly ground black pepper");
  const italianSausage = await upsertIngredient("spicy Italian sausage");
  const parsley = await upsertIngredient("fresh parsley");

  await db.insert(recipeIngredients).values([
    { recipeId: sausage.id, ingredientId: bellPeppers.id, quantity: "3", unit: "", sortOrder: 1 },
    { recipeId: sausage.id, ingredientId: gnocchi.id, quantity: "1", unit: "lb", sortOrder: 2 },
    { recipeId: sausage.id, ingredientId: oliveOil.id, quantity: "2", unit: "tbsp", sortOrder: 3 },
    { recipeId: sausage.id, ingredientId: salt.id, quantity: "1/2", unit: "tsp", sortOrder: 4 },
    { recipeId: sausage.id, ingredientId: pepper.id, quantity: "1/4", unit: "tsp", sortOrder: 5 },
    { recipeId: sausage.id, ingredientId: italianSausage.id, quantity: "1", unit: "lb", sortOrder: 6 },
    { recipeId: sausage.id, ingredientId: parsley.id, quantity: "", unit: "", optional: 1, sortOrder: 7 },
  ]);

  // --- Pan Seared Grouper with Lemon Butter Sauce --- :contentReference[oaicite:4]{index=4}
  const [grouper] = await db.insert(recipes).values({
    title: "Pan Seared Grouper with Lemon Butter Sauce",
    category: "Seafood",
    description: "Quick pan-seared grouper with garlic lemon butter and parsley.",
    instructions: [
      "Season grouper with salt and pepper on both sides. Let sit a few minutes.",
      "Heat butter over medium heat and sauté garlic for 1 minute. Avoid burning butter.",
      "Add grouper and cook about 3 minutes per side. Once you flip, baste with butter.",
      "Remove fish and set aside.",
      "Add lemon juice and parsley to the garlic butter. Sauté 1–2 minutes.",
      "Top fish with lemon butter parsley mixture and serve.",
    ].join("\n"),
  }).returning();

  const fish = await upsertIngredient("grouper filet");
  const butter = await upsertIngredient("butter");
  const lemon = await upsertIngredient("lemon");
  const garlic = await upsertIngredient("garlic");
  const parsley2 = await upsertIngredient("fresh parsley");

  await db.insert(recipeIngredients).values([
    { recipeId: grouper.id, ingredientId: fish.id, quantity: "8", unit: "oz", sortOrder: 1 },
    { recipeId: grouper.id, ingredientId: butter.id, quantity: "1-3", unit: "tbsp", sortOrder: 2 },
    { recipeId: grouper.id, ingredientId: lemon.id, quantity: "1/2", unit: "", prepNote: "juiced", sortOrder: 3 },
    { recipeId: grouper.id, ingredientId: garlic.id, quantity: "1", unit: "clove", prepNote: "minced", sortOrder: 4 },
    { recipeId: grouper.id, ingredientId: parsley2.id, quantity: "1/4", unit: "cup", prepNote: "chopped", sortOrder: 5 },
  ]);

  // --- Sesame Ginger Beef --- :contentReference[oaicite:5]{index=5}
  const [beef] = await db.insert(recipes).values({
    title: "Sesame Ginger Beef",
    category: "Beef",
    description: "Skirt steak stir-fry with green beans, garlic, ginger, and sesame.",
    instructions: [
      "Start rice.",
      "Pat beef dry. Season with salt and pepper, toss with cornstarch, set aside.",
      "In a skillet over medium-high heat, cook green beans 1 minute in 1 tsp oil.",
      "Add 2 tbsp water, cover and steam 1 minute more. Transfer beans out.",
      "Return skillet to high heat with 1 tbsp oil. Add beef and stir-fry 2–3 minutes.",
      "Reduce heat to medium. Add garlic, ginger, soy sauce, vinegar; stir to coat.",
      "Add green beans back, top with green onions and sesame seeds. Serve immediately.",
    ].join("\n"),
  }).returning();

  const skirt = await upsertIngredient("skirt steak");
  const cornstarch = await upsertIngredient("cornstarch");
  const oil = await upsertIngredient("cooking oil");
  const greenBeans = await upsertIngredient("green beans");
  const garlic2 = await upsertIngredient("garlic");
  const ginger = await upsertIngredient("fresh ginger");
  const soy = await upsertIngredient("soy sauce");
  const riceVinegar = await upsertIngredient("rice wine vinegar");
  const greenOnion = await upsertIngredient("green onions");
  const sesameSeeds = await upsertIngredient("sesame seeds");
  const rice = await upsertIngredient("rice");

  await db.insert(recipeIngredients).values([
    { recipeId: beef.id, ingredientId: skirt.id, quantity: "1", unit: "lb", sortOrder: 1 },
    { recipeId: beef.id, ingredientId: cornstarch.id, quantity: "3", unit: "tbsp", sortOrder: 2 },
    { recipeId: beef.id, ingredientId: oil.id, quantity: "1 tsp + 1 tbsp", unit: "", sortOrder: 3 },
    { recipeId: beef.id, ingredientId: greenBeans.id, quantity: "1", unit: "lb", prepNote: "trimmed", sortOrder: 4 },
    { recipeId: beef.id, ingredientId: garlic2.id, quantity: "3", unit: "cloves", prepNote: "minced", sortOrder: 5 },
    { recipeId: beef.id, ingredientId: ginger.id, quantity: '3"', unit: "piece", prepNote: "peeled & grated", sortOrder: 6 },
    { recipeId: beef.id, ingredientId: soy.id, quantity: "1/4", unit: "cup", sortOrder: 7 },
    { recipeId: beef.id, ingredientId: riceVinegar.id, quantity: "1", unit: "tbsp", sortOrder: 8 },
    { recipeId: beef.id, ingredientId: greenOnion.id, quantity: "2", unit: "", prepNote: "chopped", sortOrder: 9 },
    { recipeId: beef.id, ingredientId: sesameSeeds.id, quantity: "1", unit: "tbsp", sortOrder: 10 },
    { recipeId: beef.id, ingredientId: rice.id, quantity: "", unit: "", prepNote: "of choice", optional: 1, sortOrder: 11 },
  ]);

  // --- Shawarma Chickpea Couscous ---
  const [shawarma] = await db.insert(recipes).values({
    title: "Shawarma Chickpea Couscous",
    category: "Vegetarian",
    description: "Roasted shawarma-spiced chickpeas and vegetables over couscous with a lemony yogurt drizzle.",
    instructions: [
      "Heat oven to 425F. Thinly slice bell peppers, slice carrots, and rinse, dry, and pat chickpeas with a paper towel.",
      "Toss carrots on a section of a baking sheet with a drizzle of olive oil and 2 tsp shawarma spice blend.",
      "Toss chickpeas on another section of the baking sheet with a drizzle of olive oil and 2 tsp shawarma spice blend.",
      "Toss bell pepper on another section of the baking sheet with a drizzle of olive oil, salt, and pepper.",
      "Roast for 20 minutes, tossing the chickpeas halfway through.",
      "Melt 2 tbsp butter in a medium pot over medium-high heat. Add couscous and cook, stirring, until lightly toasted, 2 to 3 minutes.",
      "Add stock concentrate, 1 1/2 cups water, 1 1/2 tsp garlic powder, and a pinch of salt. Bring to a boil, cover, reduce heat to low, and cook until couscous is tender, 6 to 8 minutes. Keep covered off heat.",
      "In a small bowl combine yogurt, sour cream, 1/2 tsp garlic powder, lemon juice, and harissa powder to taste. Add 1 tsp water at a time until drizzly.",
      "Divide couscous into bowls, add chickpeas, bell pepper, and carrots. Top with cilantro and drizzle with yogurt sauce.",
    ].join("\n"),
  }).returning();

  const carrots = await upsertIngredient("carrots");
  const chickpeas = await upsertIngredient("chickpeas");
  const redBellPepper = await upsertIngredient("red bell pepper");
  const shawarmaBlend = await upsertIngredient(
    "shawarma spice blend",
    "2 tsp pepper, 2 tsp cumin, 2 tsp paprika, 1 tsp salt, 1/2 tsp turmeric, 1/2 tsp red pepper flakes, 1/4 tsp garlic powder"
  );
  const couscous = await upsertIngredient("Israeli couscous");
  const stockConcentrate = await upsertIngredient("veggie or chicken stock concentrate");
  const garlicPowder = await upsertIngredient("garlic powder");
  const lemon2 = await upsertIngredient("lemon");
  const cilantro = await upsertIngredient("cilantro");
  const greekYogurt = await upsertIngredient("Greek yogurt");
  const sourCream = await upsertIngredient("sour cream");
  const harissaPowder = await upsertIngredient("harissa powder");

  await db.insert(recipeIngredients).values([
    { recipeId: shawarma.id, ingredientId: carrots.id, quantity: "18", unit: "oz", sortOrder: 1 },
    { recipeId: shawarma.id, ingredientId: chickpeas.id, quantity: "1", unit: "can", sortOrder: 2 },
    { recipeId: shawarma.id, ingredientId: redBellPepper.id, quantity: "1", unit: "", sortOrder: 3 },
    { recipeId: shawarma.id, ingredientId: shawarmaBlend.id, quantity: "2", unit: "tbsp", sortOrder: 4 },
    { recipeId: shawarma.id, ingredientId: couscous.id, quantity: "2/3", unit: "cup", sortOrder: 5 },
    { recipeId: shawarma.id, ingredientId: stockConcentrate.id, quantity: "1", unit: "tbsp", sortOrder: 6 },
    { recipeId: shawarma.id, ingredientId: garlicPowder.id, quantity: "2", unit: "tsp", sortOrder: 7 },
    { recipeId: shawarma.id, ingredientId: lemon2.id, quantity: "1", unit: "", sortOrder: 8 },
    { recipeId: shawarma.id, ingredientId: cilantro.id, quantity: "1/4", unit: "oz", sortOrder: 9 },
    { recipeId: shawarma.id, ingredientId: greekYogurt.id, quantity: "2", unit: "tbsp", sortOrder: 10 },
    { recipeId: shawarma.id, ingredientId: sourCream.id, quantity: "2", unit: "tbsp", sortOrder: 11 },
    { recipeId: shawarma.id, ingredientId: harissaPowder.id, quantity: "1", unit: "tbsp", sortOrder: 12 },
  ]);
}


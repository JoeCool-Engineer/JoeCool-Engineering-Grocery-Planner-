import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteRecipeButton from "@/components/recipes/DeleteRecipeButton";
import { db } from "@/drizzle/db";
import { recipes } from "@/schema/recipes";
import { recipeIngredients } from "@/schema/recipe-ingredients";
import { ingredients } from "@/schema/ingredients";
import { asc, eq } from "drizzle-orm";

// If you already have a shared UI shell/layout, this will drop inside it.
export default async function RecipeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const recipeId = Number(params.id);
  if (!Number.isFinite(recipeId)) notFound();

  const recipe = await db.query.recipes.findFirst({
    where: (r, { eq }) => eq(r.id, recipeId),
  });

  if (!recipe) notFound();

  const rows = await db
    .select({
      id: recipeIngredients.id,
      quantity: recipeIngredients.quantity,
      unit: recipeIngredients.unit,
      prepNote: recipeIngredients.prepNote,
      optional: recipeIngredients.optional,
      sortOrder: recipeIngredients.sortOrder,
      ingredientName: ingredients.name,
    })
    .from(recipeIngredients)
    .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
    .where(eq(recipeIngredients.recipeId, recipeId))
    .orderBy(asc(recipeIngredients.sortOrder), asc(ingredients.name));

  const instructionLines =
    recipe.instructions?.split("\n").map((l) => l.trim()).filter(Boolean) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Title header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight">
              {recipe.title}
            </h1>
            <div className="text-sm text-muted-foreground">
              {recipe.category ?? "Recipe"}
            </div>
            {recipe.description ? (
              <p className="mt-2 text-base text-muted-foreground">
                {recipe.description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href={`/recipes/${recipe.id}/edit`}>Edit recipe</Link>
            </Button>
            <DeleteRecipeButton recipeId={recipe.id} />
          </div>
        </div>
      </div>

      {/* 1/3 + 2/3 layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Ingredients (1/3) */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Ingredients</h2>

            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No ingredients listed yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {rows.map((r) => {
                  const qty = r.quantity?.trim();
                  const unit = r.unit?.trim();
                  const prep = r.prepNote?.trim();

                  return (
                    <li
                      key={r.id}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium">
                          {r.ingredientName}
                          {r.optional ? (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (optional)
                            </span>
                          ) : null}
                        </div>
                        {prep ? (
                          <div className="text-xs text-muted-foreground">
                            {prep}
                          </div>
                        ) : null}
                      </div>

                      {qty || unit ? (
                        <div className="shrink-0 text-sm text-muted-foreground">
                          {qty ?? ""}
                          {qty && unit ? " " : ""}
                          {unit ?? ""}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Optional: actions you'll wire later */}
            <div className="mt-6 flex flex-col gap-2">
              <button className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
                Add ingredient
              </button>
              <button className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
                Edit ingredients
              </button>
            </div>
          </div>
        </aside>

        {/* Instructions (2/3) */}
        <section className="lg:col-span-2">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Instructions</h2>

              {/* Your later calendar integration hook */}
              <button className="rounded-xl bg-black px-3 py-2 text-sm text-white hover:opacity-90">
                Add to calendar
              </button>
            </div>

            {instructionLines.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No instructions added yet.
              </p>
            ) : (
              <ol className="space-y-4">
                {instructionLines.map((line, idx) => (
                  <li key={idx} className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold">
                      {idx + 1}
                    </div>
                    <p className="text-sm leading-relaxed">{line}</p>
                  </li>
                ))}
              </ol>
            )}

            {/* Optional notes section to match doc-like feel */}
            <div className="mt-8 rounded-xl bg-gray-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Notes
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Add storage tips, spice warnings, or temperature targets here.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

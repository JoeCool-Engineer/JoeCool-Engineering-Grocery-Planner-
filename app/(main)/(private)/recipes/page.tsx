import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { recipes } from "@/schema/recipes";
import { and, asc, eq, ilike, or, type SQL } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RecipesSearchParams = {
  q?: string | string[];
  category?: string | string[];
  cuisine?: string | string[];
};

function getParam(value?: string | string[]) {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export default async function RecipesPage({
  searchParams,
}: {
  searchParams?: Promise<RecipesSearchParams>;
}) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const resolvedParams = (await searchParams) ?? {};
  const query = getParam(resolvedParams.q).trim();
  const category = getParam(resolvedParams.category).trim();
  const cuisine = getParam(resolvedParams.cuisine).trim();

  const filters: SQL[] = [];
  if (query) {
    const like = `%${query}%`;
    filters.push(or(ilike(recipes.title, like), ilike(recipes.description, like)));
  }
  if (category) filters.push(eq(recipes.category, category));
  if (cuisine) filters.push(eq(recipes.cuisine, cuisine));

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const [recipeRows, filterRows] = await Promise.all([
    db
      .select({
        id: recipes.id,
        title: recipes.title,
        description: recipes.description,
        category: recipes.category,
        cuisine: recipes.cuisine,
      })
      .from(recipes)
      .where(whereClause)
      .orderBy(asc(recipes.title)),
    db
      .select({
        category: recipes.category,
        cuisine: recipes.cuisine,
      })
      .from(recipes),
  ]);

  const categories = Array.from(
    new Set(filterRows.map((row) => row.category).filter(Boolean))
  ).sort();
  const cuisines = Array.from(
    new Set(filterRows.map((row) => row.cuisine).filter(Boolean))
  ).sort();

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-black">Recipes</h1>
          <p className="text-sm text-muted-foreground">
            Browse the catalog and filter by keyword, category, or cuisine.
          </p>
        </div>
        <Button asChild className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90">
          <Link href="/recipes/new">Create recipe</Link>
        </Button>
      </div>

      <form
        className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-4"
        method="get"
      >
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            name="q"
            placeholder="Sausage, seafood, weeknight..."
            defaultValue={query}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue={category}
            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">All</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cuisine">Cuisine</Label>
          <select
            id="cuisine"
            name="cuisine"
            defaultValue={cuisine}
            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">All</option>
            {cuisines.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-3 md:col-span-4">
          <Button type="submit">Apply filters</Button>
          <Button asChild variant="outline">
            <Link href="/recipes">Reset</Link>
          </Button>
        </div>
      </form>

      {recipeRows.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-sm text-muted-foreground shadow-sm">
          No recipes match your filters yet.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recipeRows.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                <span>{recipe.category ?? "Recipe"}</span>
                {recipe.cuisine ? <span>{recipe.cuisine}</span> : null}
              </div>
              <h2 className="text-lg font-semibold">{recipe.title}</h2>
              {recipe.description ? (
                <p className="text-sm text-muted-foreground">
                  {recipe.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No description yet.
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

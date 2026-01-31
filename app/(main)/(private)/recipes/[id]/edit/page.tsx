import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { notFound } from "next/navigation";
import { updateRecipe } from "@/server/actions/recipes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default async function EditRecipePage({
  params,
}: {
  params: { id: string };
}) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const recipeId = Number(params.id);
  if (!Number.isFinite(recipeId)) notFound();

  const recipe = await db.query.recipes.findFirst({
    where: (r, { eq }) => eq(r.id, recipeId),
  });

  if (!recipe) notFound();

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black">Edit Recipe</h1>
          <p className="text-sm text-muted-foreground">
            Update the shared recipe details.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/recipes/${recipe.id}`}>Back to recipe</Link>
        </Button>
      </div>

      <form action={updateRecipe} className="grid gap-5 rounded-2xl border bg-white p-6 shadow-sm">
        <input type="hidden" name="id" value={recipe.id} />
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={recipe.title} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            defaultValue={recipe.description ?? ""}
          />
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              defaultValue={recipe.category ?? ""}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cuisine">Cuisine</Label>
            <Input
              id="cuisine"
              name="cuisine"
              defaultValue={recipe.cuisine ?? ""}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            name="instructions"
            defaultValue={recipe.instructions}
            rows={8}
            required
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Update recipe</Button>
        </div>
      </form>
    </section>
  );
}

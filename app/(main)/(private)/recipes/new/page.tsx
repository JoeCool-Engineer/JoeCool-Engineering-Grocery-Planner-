import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { createRecipe } from "@/server/actions/recipes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default async function NewRecipePage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black">Create Recipe</h1>
          <p className="text-sm text-muted-foreground">
            Add a new recipe to the shared catalog.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/recipes">Back to recipes</Link>
        </Button>
      </div>

      <form action={createRecipe} className="grid gap-5 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="Recipe title" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" placeholder="Quick summary" />
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" placeholder="Seafood, Beef..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cuisine">Cuisine</Label>
            <Input id="cuisine" name="cuisine" placeholder="Italian, Asian..." />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            name="instructions"
            placeholder="Step-by-step instructions"
            rows={8}
            required
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save recipe</Button>
        </div>
      </form>
    </section>
  );
}

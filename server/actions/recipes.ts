'use server'

import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { recipes } from "@/schema/recipes";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const recipeFormSchema = z.object({
  title: z.string().min(2, "Title is required."),
  description: z.string().optional(),
  instructions: z.string().min(2, "Instructions are required."),
  cuisine: z.string().optional(),
  category: z.string().optional(),
});

export async function createRecipe(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  const parsed = recipeFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    instructions: formData.get("instructions"),
    cuisine: formData.get("cuisine") || undefined,
    category: formData.get("category") || undefined,
  });

  if (!parsed.success) {
    throw new Error("Invalid recipe data.");
  }

  await db.insert(recipes).values(parsed.data);

  revalidatePath("/recipes");
  redirect("/recipes");
}

export async function updateRecipe(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  const parsed = recipeFormSchema
    .extend({ id: z.coerce.number().int().positive() })
    .safeParse({
      id: formData.get("id"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      instructions: formData.get("instructions"),
      cuisine: formData.get("cuisine") || undefined,
      category: formData.get("category") || undefined,
    });

  if (!parsed.success) {
    throw new Error("Invalid recipe data.");
  }

  const { id, ...updateData } = parsed.data;

  await db.update(recipes).set(updateData).where(eq(recipes.id, id));

  revalidatePath(`/recipes/${id}`);
  revalidatePath("/recipes");
  redirect(`/recipes/${id}`);
}

export async function deleteRecipe(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  const parsed = z
    .object({ id: z.coerce.number().int().positive() })
    .safeParse({
      id: formData.get("id"),
    });

  if (!parsed.success) {
    throw new Error("Invalid recipe id.");
  }

  await db.delete(recipes).where(eq(recipes.id, parsed.data.id));

  revalidatePath("/recipes");
  redirect("/recipes");
}

'use server'

import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { meals } from "@/schema/meals";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { recipes } from "@/schema/recipes";
import { createCalendarEvent } from "./google/googleCalendar";

const mealFormSchema = z.object({
  recipeId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  durationMinutes: z.coerce.number().int().min(5).max(1440),
  slot: z.string().min(1).max(32).optional(),
});

export async function createMeal(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  const parsed = mealFormSchema.safeParse({
    recipeId: formData.get("recipeId"),
    date: formData.get("date"),
    time: formData.get("time"),
    durationMinutes: formData.get("durationMinutes"),
    slot: formData.get("slot") ?? undefined,
  });

  if (!parsed.success) {
    throw new Error("Invalid meal data.");
  }

  const { recipeId, date, time, durationMinutes, slot } = parsed.data;
  const startsAt = new Date(`${date}T${time}`);

  const recipe = await db.query.recipes.findFirst({
    where: (r, { eq }) => eq(r.id, recipeId),
  });

  if (!recipe) {
    throw new Error("Recipe not found.");
  }

  await db.insert(meals).values({
    recipeId,
    clerkUserId: userId,
    day: date,
    slot: slot ?? "dinner",
    startsAt,
    durationMinutes,
  });

  try {
    await createCalendarEvent({
      clerkUserId: userId,
      startTime: startsAt,
      durationInMinutes: durationMinutes,
      eventName: `Meal: ${recipe.title}`,
      guestNotes: slot ? `Meal slot: ${slot}` : undefined,
    });
  } catch (error: any) {
    console.error(`Failed to create calendar meal: ${error.message || error}`);
  }

  revalidatePath("/meal-plan");
}

export async function deleteMeal(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  const parsed = z
    .object({
      mealId: z.coerce.number().int().positive(),
    })
    .safeParse({
      mealId: formData.get("mealId"),
    });

  if (!parsed.success) {
    throw new Error("Invalid meal id.");
  }

  await db
    .delete(meals)
    .where(and(eq(meals.id, parsed.data.mealId), eq(meals.clerkUserId, userId)));

  revalidatePath("/meal-plan");
}

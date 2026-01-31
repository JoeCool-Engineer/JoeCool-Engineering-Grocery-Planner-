import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { meals } from "@/schema/meals";
import { recipes } from "@/schema/recipes";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { createMeal, deleteMeal } from "@/server/actions/meals";
import { addDays, format, isValid, parseISO, startOfWeek } from "date-fns";

type MealPlanSearchParams = {
  week?: string | string[];
};

function getParam(value?: string | string[]) {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

function getDayKey(value: Date | string) {
  if (typeof value === "string") return value;
  return format(value, "yyyy-MM-dd");
}

export default async function MealPlanPage({
  searchParams,
}: {
  searchParams?: Promise<MealPlanSearchParams>;
}) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const resolvedParams = (await searchParams) ?? {};
  const weekParam = getParam(resolvedParams.week);
  const baseDate = weekParam ? parseISO(weekParam) : new Date();
  const safeDate = isValid(baseDate) ? baseDate : new Date();
  const weekStart = startOfWeek(safeDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const weekStartKey = format(weekStart, "yyyy-MM-dd");
  const weekEndKey = format(weekEnd, "yyyy-MM-dd");

  const [recipeRows, mealRows] = await Promise.all([
    db
      .select({ id: recipes.id, title: recipes.title })
      .from(recipes)
      .orderBy(asc(recipes.title)),
    db
      .select({
        id: meals.id,
        day: meals.day,
        slot: meals.slot,
        startsAt: meals.startsAt,
        durationMinutes: meals.durationMinutes,
        recipeTitle: recipes.title,
      })
      .from(meals)
      .innerJoin(recipes, eq(meals.recipeId, recipes.id))
      .where(
        and(
          eq(meals.clerkUserId, userId),
          gte(meals.day, weekStartKey),
          lte(meals.day, weekEndKey)
        )
      )
      .orderBy(asc(meals.startsAt)),
  ]);

  const mealsByDay = new Map<string, typeof mealRows>();
  for (const meal of mealRows) {
    const key = getDayKey(meal.day);
    const list = mealsByDay.get(key) ?? [];
    list.push(meal);
    mealsByDay.set(key, list);
  }

  const days = Array.from({ length: 7 }, (_, idx) => addDays(weekStart, idx));
  const previousWeek = format(addDays(weekStart, -7), "yyyy-MM-dd");
  const nextWeek = format(addDays(weekStart, 7), "yyyy-MM-dd");

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-black">Meal Plan</h1>
        <p className="text-sm text-muted-foreground">
          Assign recipes to specific days, times, and durations.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/meal-plan?week=${previousWeek}`}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Previous week
          </Link>
          <div className="text-sm font-semibold">
            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d")}
          </div>
          <Link
            href={`/meal-plan?week=${nextWeek}`}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Next week
          </Link>
        </div>
        <Link
          href="/meal-plan"
          className="rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-gray-50"
        >
          This week
        </Link>
      </div>

      <div className="grid gap-6">
        {days.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayMeals = mealsByDay.get(dayKey) ?? [];

          return (
            <div key={dayKey} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">
                    {format(day, "EEEE")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(day, "MMM d, yyyy")}
                  </div>
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {dayMeals.length} meal{dayMeals.length === 1 ? "" : "s"}
                </div>
              </div>

              {dayMeals.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No meals planned yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {dayMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">
                          {meal.recipeTitle}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(meal.startsAt, "h:mm a")} · {meal.durationMinutes} min
                          {meal.slot ? ` · ${meal.slot}` : ""}
                        </div>
                      </div>
                      <form action={deleteMeal}>
                        <input type="hidden" name="mealId" value={meal.id} />
                        <button className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50">
                          Remove
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}

              <form action={createMeal} className="mt-5 grid gap-3 md:grid-cols-5">
                <input type="hidden" name="date" value={dayKey} />
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Recipe
                  </label>
                  <select
                    name="recipeId"
                    className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Select a recipe
                    </option>
                    {recipeRows.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    defaultValue="18:00"
                    className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Duration
                  </label>
                  <input
                    type="number"
                    name="durationMinutes"
                    defaultValue={45}
                    min={5}
                    step={5}
                    className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Slot
                  </label>
                  <select
                    name="slot"
                    className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    defaultValue="dinner"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div className="md:col-span-5">
                  <button className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90">
                    Add meal
                  </button>
                </div>
              </form>
            </div>
          );
        })}
      </div>
    </section>
  );
}

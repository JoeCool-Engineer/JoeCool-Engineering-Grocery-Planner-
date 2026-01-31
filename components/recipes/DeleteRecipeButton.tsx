"use client";

import type { FormEvent } from "react";
import { deleteRecipe } from "@/server/actions/recipes";

type DeleteRecipeButtonProps = {
  recipeId: number;
};

export default function DeleteRecipeButton({
  recipeId,
}: DeleteRecipeButtonProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const ok = window.confirm(
      "Are you sure you want to delete this recipe?"
    );
    if (!ok) {
      event.preventDefault();
    }
  };

  return (
    <form action={deleteRecipe} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={recipeId} />
      <button
        type="submit"
        className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
      >
        Delete recipe
      </button>
    </form>
  );
}

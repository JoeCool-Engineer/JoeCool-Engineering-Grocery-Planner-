import "dotenv/config";
import { seedRecipes } from "./recipes.seed";

async function main() {
  await seedRecipes();
}

main()
  .then(() => {
    console.log("Seeding complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });

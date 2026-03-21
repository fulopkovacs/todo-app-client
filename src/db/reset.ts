import { config } from "dotenv";
import { seed } from "./seed";

config({ path: process.env.ENV_FILE || ".env" });

import { db } from ".";
import {
  boardsTable,
  projectsTable,
  seedTable,
  todoItemsTable,
  usersTable,
} from "./schema";

async function reset() {
  console.log("Resetting database...");

  await db.transaction(async (tx) => {
    // Delete in order respecting foreign key constraints
    await tx.delete(todoItemsTable);
    await tx.delete(boardsTable);
    await tx.delete(projectsTable);
    await tx.delete(usersTable);
    await tx.delete(seedTable);
  });

  console.log("Database reset complete. Re-seeding...");

  const result = await seed();
  console.log("Seeding complete:", result);
}

reset()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Reset failed:", err);
    process.exit(1);
  });

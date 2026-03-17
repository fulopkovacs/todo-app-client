import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

config({ path: process.env.ENV_FILE || ".env", override: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Check your .env or ENV_FILE.");
}

const client = postgres(databaseUrl);

export const db = drizzle({ client });

export type DB = typeof db;

import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { boardsTable } from "@/db/schema";

export const Route = createFileRoute("/api/boards")({
  server: {
    handlers: {
      GET: async () => {
        const results = await db.select().from(boardsTable);

        return Response.json(results);
      },
    },
  },
});

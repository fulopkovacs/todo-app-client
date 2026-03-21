import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { type TodoItemRecord, todoItemsTable } from "@/db/schema";

const todoItemCreateData = z.object({
  id: z.string().min(1),
  boardId: z.string(),
  projectId: z.string(),
  priority: z.number().min(0).max(3).int().optional().nullable(),
  title: z.string(),
  description: z.string().optional().nullable(),
  position: z.string(),
});

export type TodoItemCreateDataType = z.infer<typeof todoItemCreateData>;

const todoItemUpdateData = z.object({
  id: z.string(),
  boardId: z.string().optional(),
  priority: z.number().nullable().optional(),
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  position: z.string().optional(),
});

export const Route = createFileRoute("/api/todo-items")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);

        const projectId = url.searchParams.get("projectId");

        if (projectId) {
          const results = await db
            .select()
            .from(todoItemsTable)
            .where(eq(todoItemsTable.projectId, projectId));
          return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" },
          });
        }
        const results = await db.select().from(todoItemsTable);
        return new Response(JSON.stringify(results), {
          headers: { "Content-Type": "application/json" },
        });
      },
      POST: async ({ request }) => {
        let newTodoItemData: z.infer<typeof todoItemCreateData>;
        // biome-ignore lint/suspicious/noExplicitAny: it can be any here
        let bodyObj: any;

        try {
          bodyObj = await request.json();
        } catch (e) {
          console.error("Error parsing JSON body:", e);
          return new Response("Invalid JSON body", { status: 400 });
        }

        try {
          const todoItemData = todoItemCreateData.parse(bodyObj);
          newTodoItemData = todoItemData;
        } catch (e) {
          console.error("Validation error:", e);
          if (e instanceof z.ZodError) {
            return new Response(`Invalid request data: ${z.prettifyError(e)}`, {
              status: 400,
            });
          }
          console.error("Bad format", e);
          return new Response("Validation error", { status: 400 });
        }

        const { description } = newTodoItemData;

        if (!description) {
          return new Response("Description is required", { status: 400 });
        }

        await db.insert(todoItemsTable).values({
          ...newTodoItemData,
          description,
          createdAt: new Date(),
          priority: 0,
        } satisfies TodoItemRecord);

        return new Response(null, { status: 201 });
      },
      DELETE: async ({ request }) => {
        // biome-ignore lint/suspicious/noExplicitAny: it can be any here
        let bodyObj: any;

        try {
          bodyObj = await request.json();
        } catch (e) {
          console.error("Error parsing JSON body:", e);
          return new Response("Invalid JSON body", { status: 400 });
        }

        const parsed = z.object({ id: z.string().min(1) }).safeParse(bodyObj);
        if (!parsed.success) {
          return new Response("Invalid request data", { status: 400 });
        }

        const deleted = await db
          .delete(todoItemsTable)
          .where(eq(todoItemsTable.id, parsed.data.id))
          .returning();

        if (deleted.length === 0) {
          return new Response("Todo item not found", { status: 404 });
        }

        return new Response(null, { status: 204 });
      },
      PATCH: async ({ request }) => {
        let updatedData: z.infer<typeof todoItemUpdateData>;

        // biome-ignore lint/suspicious/noExplicitAny: it can be any here
        let bodyObj: any;

        try {
          bodyObj = await request.json();
        } catch (e) {
          console.error("Error parsing JSON body:", e);
          return new Response("Invalid JSON body", { status: 400 });
        }

        try {
          updatedData = todoItemUpdateData.parse(bodyObj);
        } catch (e) {
          console.error("Validation error:", e);
          if (e instanceof z.ZodError) {
            return new Response(`Invalid request data: ${z.prettifyError(e)}`, {
              status: 400,
            });
          }
          console.error("Bad format", e);
          return new Response("Validation error", { status: 400 });
        }

        if (
          Object.keys(updatedData).length === 1 // there aren't keys other than id
        ) {
          return new Response("No columns to update", { status: 400 });
        }

        const [updatedTodoItemData] = await db
          .update(todoItemsTable)
          .set(updatedData)
          .where(eq(todoItemsTable.id, updatedData.id))
          .returning();

        if (!updatedTodoItemData) {
          return new Response("Todo item not found", { status: 404 });
        }

        return new Response(JSON.stringify(updatedTodoItemData), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

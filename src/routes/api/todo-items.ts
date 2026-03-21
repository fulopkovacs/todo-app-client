import { createFileRoute } from "@tanstack/react-router";
import { eq, sql } from "drizzle-orm";
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

        let txid: number | undefined;

        await db.transaction(async (tx) => {
          await tx.insert(todoItemsTable).values({
            ...newTodoItemData,
            description,
            createdAt: new Date(),
            priority: 0,
          } satisfies TodoItemRecord);

          const [result] = await tx.execute<{ txid: string }>(
            sql`SELECT pg_current_xact_id()::text as txid`,
          );
          txid = Number(result.txid);
        });

        return new Response(JSON.stringify({ txid }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
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

        let txid: number | undefined;

        await db.transaction(async (tx) => {
          const deleted = await tx
            .delete(todoItemsTable)
            .where(eq(todoItemsTable.id, parsed.data.id))
            .returning();

          if (deleted.length === 0) {
            throw new Error("Todo item not found");
          }

          const [txResult] = await tx.execute<{ txid: string }>(
            sql`SELECT pg_current_xact_id()::text as txid`,
          );
          txid = Number(txResult.txid);
        });

        if (txid === undefined) {
          return new Response("Todo item not found", { status: 404 });
        }

        return new Response(JSON.stringify({ txid }), {
          headers: { "Content-Type": "application/json" },
        });
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

        let txid: number | undefined;
        let updatedTodoItemData: TodoItemRecord | undefined;

        await db.transaction(async (tx) => {
          const [result] = await tx
            .update(todoItemsTable)
            .set(updatedData)
            .where(eq(todoItemsTable.id, updatedData.id))
            .returning();
          updatedTodoItemData = result;

          const [txResult] = await tx.execute<{ txid: string }>(
            sql`SELECT pg_current_xact_id()::text as txid`,
          );
          txid = Number(txResult.txid);
        });

        if (!updatedTodoItemData) {
          return new Response("Todo item not found", { status: 404 });
        }

        return new Response(JSON.stringify({ txid, ...updatedTodoItemData }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

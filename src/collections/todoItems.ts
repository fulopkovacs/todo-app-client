import { snakeCamelMapper } from "@electric-sql/client";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import { toast } from "sonner";
import { z } from "zod";
import { PROXY_URL_BASE } from "@/PROXY_URL_BASE";
import type { TodoItemCreateDataType } from "@/routes/api/todo-items";

const todoItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.union([z.string(), z.null()]),
  createdAt: z.coerce.date(),
  boardId: z.string(),
  projectId: z.string(),
  priority: z.union([z.number(), z.null()]),
  position: z.string(),
});

export const todoItemsCollection = createCollection(
  electricCollectionOptions({
    id: "todo-items",
    schema: todoItemSchema,
    shapeOptions: {
      url: `${PROXY_URL_BASE}/todo-items`,
      parser: { timestamptz: (v: string) => new Date(v) },
      columnMapper: snakeCamelMapper(),
    },
    onInsert: async ({ transaction }) => {
      const { modified: newTodoItem } = transaction.mutations[0];

      const res = await fetch("/api/todo-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodoItem satisfies TodoItemCreateDataType),
      });

      if (!res.ok) {
        toast.error(`Failed to insert todo item "${newTodoItem.title}"`);
        throw new Error("Failed to insert todo item");
      }

      const data: { txid: number } = await res.json();
      return { txid: data.txid };
    },
    onUpdate: async ({ transaction }) => {
      const { modified } = transaction.mutations[0];

      const res = await fetch("/api/todo-items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: modified.id,
          boardId: modified.boardId,
          priority: modified.priority,
          title: modified.title,
          description: modified.description,
          position: modified.position,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update todo item");
      }

      const data: { txid: number } = await res.json();
      return { txid: data.txid };
    },
    getKey: (item) => item.id,
  }),
);

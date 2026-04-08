import { snakeCamelMapper } from "@electric-sql/client";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import { toast } from "sonner";
import { z } from "zod";
import { PROXY_ORIGIN } from "@/PROXY_ORIGIN";
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
      url: `${PROXY_ORIGIN}/api/electric/todo_items`,
      parser: { timestamptz: (v: string) => new Date(v) },
      columnMapper: snakeCamelMapper(),
    },
    onInsert: async ({ transaction, collection }) => {
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

      const jsonRes = await res.json();

      const { txid } = z
        .object({
          txid: z.number(),
        })
        .parse(jsonRes);

      await collection.utils.awaitTxId(txid);
    },
    onDelete: async ({ transaction, collection }) => {
      const { original } = transaction.mutations[0];

      const res = await fetch("/api/todo-items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: original.id }),
      });

      if (!res.ok) {
        toast.error(`Failed to delete todo item "${original.title}"`);
        throw new Error("Failed to delete todo item");
      }

      const jsonRes = await res.json();

      const { txid } = z
        .object({
          txid: z.number(),
        })
        .parse(jsonRes);

      await collection.utils.awaitTxId(txid);
    },
    onUpdate: async ({ transaction, collection }) => {
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
        toast.error(`Failed to update todo item "${modified.title}"`);
        throw new Error("Failed to update todo item");
      }

      const jsonRes = await res.json();

      const { txid } = z
        .object({
          txid: z.number(),
        })
        .parse(jsonRes);

      await collection.utils.awaitTxId(txid);
    },
    getKey: (item) => item.id,
  }),
);

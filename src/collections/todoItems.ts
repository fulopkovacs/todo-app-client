import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { toast } from "sonner";
import { z } from "zod";
import { queryCollectionClient } from "@/collections/queryClient";
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
  queryCollectionOptions({
    id: "todo-items",
    queryKey: ["todo-items"],
    queryClient: queryCollectionClient,
    queryFn: async () => {
      const res = await fetch("/api/todo-items");

      if (!res.ok) {
        toast.error("Failed to fetch todo items");
        throw new Error("Failed to fetch todo items");
      }

      return z.array(todoItemSchema).parse(await res.json());
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
    },
    onDelete: async ({ transaction }) => {
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
        toast.error(`Failed to update todo item "${modified.title}"`);
        throw new Error("Failed to update todo item");
      }
    },
    getKey: (item) => item.id,
  }),
);

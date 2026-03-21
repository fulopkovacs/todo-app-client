import { createFileRoute } from "@tanstack/react-router";
import { createElectricShapeHandler } from "@/server/electric/createElectricShapeHandler";

export const Route = createFileRoute("/api/electric/todo-items")({
  server: {
    handlers: {
      GET: createElectricShapeHandler("todo_items"),
    },
  },
});

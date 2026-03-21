import { createFileRoute } from "@tanstack/react-router";
import { createElectricShapeHandler } from "@/server/electric/createElectricShapeHandler";

export const Route = createFileRoute("/api/electric/boards")({
  server: {
    handlers: {
      GET: createElectricShapeHandler("boards"),
    },
  },
});

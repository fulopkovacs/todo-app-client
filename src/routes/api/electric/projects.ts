import { createFileRoute } from "@tanstack/react-router";
import { createElectricShapeHandler } from "@/server/electric/createElectricShapeHandler";

export const Route = createFileRoute("/api/electric/projects")({
  server: {
    handlers: {
      GET: createElectricShapeHandler("projects"),
    },
  },
});

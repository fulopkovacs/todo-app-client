import { snakeCamelMapper } from "@electric-sql/client";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import { toast } from "sonner";
import { z } from "zod";
import type { ProjectUpdateData } from "@/routes/api/projects";
import { projectErrorNames } from "@/utils/errorNames";
import { PROXY_URL_BASE } from "@/PROXY_URL_BASE";

export class ProjectsNotFoundFromAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectsNotFoundError";
  }
}

const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.coerce.date(),
});

export const projectsCollection = createCollection(
  electricCollectionOptions({
    schema: projectSchema,
    shapeOptions: {
      url: `${PROXY_URL_BASE}/api/electric/projects`,
      parser: { timestamptz: (v: string) => new Date(v) },
      columnMapper: snakeCamelMapper(),
    },
    onUpdate: async ({ transaction }) => {
      const { original, changes } = transaction.mutations[0];
      try {
        const res = await fetch("/api/projects", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: original.id,
            ...changes,
          } satisfies ProjectUpdateData),
        });

        if (!res.ok) {
          const errorData = await res.text();
          throw new Error(errorData);
        }

        const data: { txid: number } = await res.json();
        return { txid: data.txid };
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.startsWith(projectErrorNames.PROJECT_NAME_EXISTS)
        ) {
          toast.error(
            `Couldn't rename "${original.name}" to "${changes.name}", because a project with that name already exists.`,
          );
        } else {
          console.error("Failed to update project:", error);
        }
        throw error;
      }
    },
    getKey: (item) => item.id,
  }),
);

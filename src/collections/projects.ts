import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { toast } from "sonner";
import { z } from "zod";
import { queryCollectionClient } from "@/collections/queryClient";
import type { ProjectUpdateData } from "@/routes/api/projects";
import { projectErrorNames } from "@/utils/errorNames";

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
  queryCollectionOptions({
    id: "projects",
    queryKey: ["projects"],
    queryClient: queryCollectionClient,
    queryFn: async () => {
      const res = await fetch("/api/projects");

      if (res.status === 404) {
        toast.error("Projects not found");
        throw new ProjectsNotFoundFromAPIError(
          "Projects endpoint returned 404",
        );
      }

      if (!res.ok) {
        toast.error("Failed to fetch projects");
        throw new Error("Failed to fetch projects");
      }

      return z.array(projectSchema).parse(await res.json());
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
          toast.error(`Failed to update project "${original.name}"`);
          throw new Error(errorData);
        }

        return;
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

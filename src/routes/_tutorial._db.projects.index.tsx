import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import type { ProjectRecord } from "@/db/schema";

export const Route = createFileRoute("/_tutorial/_db/projects/")({
  beforeLoad: async () => {
    const res = await fetch("/api/projects");
    if (!res.ok) {
      throw notFound();
    }
    const projects: ProjectRecord[] = await res.json();
    const firstProject = projects[0];
    const id = firstProject?.id;

    if (!id) {
      throw notFound();
    }

    throw redirect({
      to: "/projects/$projectId",
      params: {
        projectId: id,
      },
    });
  },
  notFoundComponent: () => {
    return <div>No projects were found in the database.</div>;
  },
});

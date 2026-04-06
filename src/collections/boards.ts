import { PROXY_ORIGIN } from "@/PROXY_ORIGIN";
import { snakeCamelMapper } from "@electric-sql/client";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import { z } from "zod";

const boardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.union([z.string(), z.null()]),
  createdAt: z.coerce.date(),
  projectId: z.string(),
});

export const boardCollection = createCollection(
  electricCollectionOptions({
    id: "boards",
    schema: boardSchema,
    shapeOptions: {
      url: `${PROXY_ORIGIN}/api/electric/boards`,
      parser: { timestamptz: (v: string) => new Date(v) },
      columnMapper: snakeCamelMapper(),
    },
    getKey: (item) => item.id,
  }),
);

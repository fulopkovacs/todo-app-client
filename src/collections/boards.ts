import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { toast } from "sonner";
import { z } from "zod";
import { queryCollectionClient } from "@/collections/queryClient";

const boardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.union([z.string(), z.null()]),
  createdAt: z.coerce.date(),
  projectId: z.string(),
});

export const boardCollection = createCollection(
  queryCollectionOptions({
    id: "boards",
    queryKey: ["boards"],
    queryClient: queryCollectionClient,
    queryFn: async () => {
      const res = await fetch("/api/boards");

      if (!res.ok) {
        toast.error("Failed to fetch boards");
        throw new Error("Failed to fetch boards");
      }

      return z.array(boardSchema).parse(await res.json());
    },
    getKey: (item) => item.id,
  }),
);

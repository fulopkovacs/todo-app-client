import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/electric/todo-items")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const electricUrl = process.env.ELECTRIC_URL;
        const electricSource = process.env.ELECTRIC_SOURCE;
        const electricApiSecret = process.env.ELECTRIC_API_SECRET;

        if (!electricUrl || !electricSource || !electricApiSecret) {
          return new Response("Electric environment variables not configured", {
            status: 500,
          });
        }

        const url = new URL(request.url);
        const originUrl = new URL(`${electricUrl}/shape`);

        url.searchParams.forEach((value, key) => {
          if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
            originUrl.searchParams.set(key, value);
          }
        });

        originUrl.searchParams.set("table", "todo_items");
        originUrl.searchParams.set("source_id", electricSource);

        const response = await fetch(originUrl.toString(), {
          headers: {
            Authorization: `Bearer ${electricApiSecret}`,
          },
        });

        const headers = new Headers(response.headers);
        headers.delete("content-encoding");
        headers.delete("content-length");

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      },
    },
  },
});

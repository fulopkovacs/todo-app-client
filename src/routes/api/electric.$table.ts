import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/electric/$table")({
  server: {
    handlers: {
      GET: async ({ request, params: { table } }) => {
        // NOTE: You need to handle auth here in a REAL app
        // (make sure that this API route is not accessible for authenticated users!)

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

        // Make sure we forward all the Electric-specific search params to Electric
        url.searchParams.forEach((value, key) => {
          if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
            originUrl.searchParams.set(key, value);
          }
        });

        // Set the table & source
        originUrl.searchParams.set("table", table);
        originUrl.searchParams.set("source_id", electricSource);

        // Handle the auth
        const response = await fetch(originUrl.toString(), {
          headers: {
            Authorization: `Bearer ${electricApiSecret}`,
          },
        });

        // Clean up the response from Electric
        const headers = new Headers(response.headers);
        headers.delete("content-encoding");
        headers.delete("content-length");

        // Forward Electric's response to the client
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      },
    },
  },
});

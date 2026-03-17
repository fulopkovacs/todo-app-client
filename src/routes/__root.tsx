import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  redirect,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TriangleAlertIcon } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { getIsMobile } from "@/server/functions/getIsMobile";
import { seo } from "@/utils/seo";
import appCss from "../styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ location }) => {
    // Skip redirect if already on /mobile to avoid infinite loop
    if (location.pathname === "/mobile") {
      return;
    }

    const isMobile = await getIsMobile();

    if (isMobile) {
      throw redirect({
        to: "/mobile",
      });
    }
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "trytanstackdb | The interactive guide",
        description: `Learn how to build ⚡BLAZING FAST⚡ front-ends with TanStack DB in 6-7 minutes`,
        image: `https://trytanstackdb.com/og-image.png`,
        keywords: "tanstack,tanstack db,reactjs,tutorial",
      }),
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  errorComponent: ErrorComponent,
});

function ErrorComponent({ error }: { error: unknown }) {
  const isDbQueryError =
    error instanceof Error && error.message.startsWith("Failed query: ");

  return (
    <div className="fixed inset-0 w-screen h-screen flex justify-center items-center p-6 bg-background">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <h2 className="text-2xl font-bold text-destructive text-center justify-center flex items-center gap-2">
            <TriangleAlertIcon /> An error occurred
          </h2>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {isDbQueryError ? (
            <p>
              There was an issue executing a database query. Please ensure that
              the backend server is running and accessible.
            </p>
          ) : null}
          <p className="font-bold">Error message:</p>
          <pre className="wrap-break-word whitespace-pre-wrap text max-h-40 text-muted-foreground overflow-y-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-hidden!">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "TanStack Query",
              render: <ReactQueryDevtoolsPanel />,
              defaultOpen: true,
            },
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel />,
              defaultOpen: false,
            },
          ]}
        />
        <script
          defer
          src="https://assets.onedollarstats.com/stonks.js"
        ></script>
        <Scripts />
      </body>
    </html>
  );
}

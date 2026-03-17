import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mobile")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <p className="text-muted-foreground">
        This app is not available on mobile devices.
      </p>
    </div>
  );
}

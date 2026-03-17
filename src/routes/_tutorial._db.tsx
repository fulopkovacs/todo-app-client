import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { userPreferencesCollection } from "@/collections/UserPreferences";
import { FakeProgressIndicator } from "@/components/FakeProgressIndicator";
import { USER_PLACEHOLDER } from "@/utils/USER_PLACEHOLDER_CONSTANT";

export const Route = createFileRoute("/_tutorial/_db")({
  ssr: true,
  component: RouteComponent,
  pendingComponent: FakeProgressIndicator,
  // Show the pending component for at least 500ms
  pendingMinMs: 500,
});

function RouteComponent() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const existingUser = userPreferencesCollection.get(USER_PLACEHOLDER.id);

      if (!existingUser) {
        userPreferencesCollection.insert({
          id: USER_PLACEHOLDER.id,
        });
      }
    }
  }, []);

  return <Outlet />;
}

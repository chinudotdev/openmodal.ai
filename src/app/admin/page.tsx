import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { AdminOverview } from "./_components/admin-overview";

export default async function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage users, content, moderation, and platform settings
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <AdminOverview />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { UserList } from "./_components/user-list";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage users, roles, and account status
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <UserList />
      </Suspense>
    </div>
  );
}


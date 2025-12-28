import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { NominationsList } from "./_components/nominations-list";

export default function NominationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Moderator Nominations</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve moderator nominations
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <NominationsList />
      </Suspense>
    </div>
  );
}

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getModerationStats } from "@/actions/moderation";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/lib/auth";
import { ModerationStats } from "./moderation-stats";
import { ModerationTabs } from "./moderation-tabs";

interface ModerationQueueProps {
  activeTab: "pending" | "flagged" | "disputed";
}

export async function ModerationQueue({ activeTab }: ModerationQueueProps) {
  const canModerate = await auth.api.userHasPermission({
    headers: await headers(),
    body: {
      permissions: {
        moderation: ["approve", "reject", "request_changes"],
      },
    },
  });

  if (!canModerate) {
    redirect("/403");
  }

  const stats = await getModerationStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Moderation Queue</h1>
        <p className="text-muted-foreground mt-1">
          Review and moderate reports submitted by the community
        </p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="p-12">
              <div className="flex items-center justify-center">
                <Spinner className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        }
      >
        <ModerationStats stats={stats} />
      </Suspense>

      <Suspense
        fallback={
          <Card>
            <CardContent className="p-12">
              <div className="flex items-center justify-center">
                <Spinner className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        }
      >
        <ModerationTabs stats={stats} activeTab={activeTab} />
      </Suspense>
    </div>
  );
}

import { getUserDashboard } from "@/actions/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardOverview } from "./dashboard-overview";
import { DashboardStats } from "./dashboard-stats";
import { UserReportsList } from "./user-reports-list";
import { DashboardNotifications } from "./dashboard-notifications";
import { TrackedCapabilities } from "./tracked-capabilities";
import { PersonalizedFeed } from "./personalized-feed";

export async function DashboardContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackURL=/dashboard");
  }

  const data = await getUserDashboard(session.user.id);

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Failed to load dashboard data
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <DashboardOverview
        reputation={data.reputation}
        badges={data.badges}
        profile={data.profile}
      />
      <DashboardStats stats={data.stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardNotifications userId={session.user.id} />
        <TrackedCapabilities capabilities={data.trackedCapabilities} />
      </div>
      <PersonalizedFeed userId={session.user.id} />
      <UserReportsList reports={data.reports} />
    </div>
  );
}

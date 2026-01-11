import { Home } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserDashboard } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { DashboardNotifications } from "./dashboard-notifications";
import { DashboardOverview } from "./dashboard-overview";
import { DashboardStats } from "./dashboard-stats";
import { PersonalizedFeed } from "./personalized-feed";
import { RecentActivity } from "./recent-activity";
import { RoleProgressionCard } from "./role-progression-card";
import { TrackedCapabilities } from "./tracked-capabilities";
import { UserReportsList } from "./user-reports-list";

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
      <div className="container mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-start">
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>
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
      <div className="flex items-center justify-start">
        <Button variant="outline" asChild>
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>
      <DashboardOverview
        user={data.user}
        reputation={data.reputation}
        badges={data.badges}
        profile={data.profile}
        streaks={data.streaks}
      />
      <DashboardStats stats={data.stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivity userId={session.user.id} />
        <DashboardNotifications userId={session.user.id} />
      </div>
      {data.reputation && (
        <RoleProgressionCard
          userId={session.user.id}
          currentTier={data.reputation.tier}
          reputationPoints={data.reputation.reputationPoints}
        />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrackedCapabilities capabilities={data.trackedCapabilities} />
        <PersonalizedFeed userId={session.user.id} />
      </div>
      <UserReportsList reports={data.reports} />
    </div>
  );
}

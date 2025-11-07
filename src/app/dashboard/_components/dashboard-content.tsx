"use client";

import { getUserDashboard } from "@/actions/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/contexts/session-context";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardOverview } from "./dashboard-overview";
import { DashboardStats } from "./dashboard-stats";
import { UserReportsList } from "./user-reports-list";

export function DashboardContent() {
  const { user, isLoading: isSessionLoading } = useSession();
  const router = useRouter();

  // Call useQuery unconditionally at the top level
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error("User ID is required");
      }
      return getUserDashboard(user.id);
    },
    enabled: !!user?.id, // Only run query when user exists
  });

  // Redirect if no user (after session loads)
  useEffect(() => {
    if (!isSessionLoading && !user) {
      router.push("/");
    }
  }, [user, isSessionLoading, router]);

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !data) {
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
      <UserReportsList reports={data.reports} />
    </div>
  );
}

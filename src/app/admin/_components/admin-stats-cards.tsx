import { AlertTriangle, FileText, Users } from "lucide-react";
import type { AdminOverviewStats } from "@/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminStatsCardsProps {
  stats: AdminOverviewStats;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Platform Stats</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalUsers.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Total Users</p>
          <div className="mt-4 space-y-1">
            <div className="text-sm">
              <span className="font-medium">
                {stats.verifiedReports.toLocaleString()}
              </span>{" "}
              <span className="text-muted-foreground">Verified Reports</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">
                {stats.totalReports.toLocaleString()}
              </span>{" "}
              <span className="text-muted-foreground">Total Reports</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">User Activity</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsersToday}</div>
          <p className="text-xs text-muted-foreground">Active Today</p>
          <div className="mt-4 space-y-1">
            <div className="text-sm">
              <span className="font-medium">{stats.activeUsersThisWeek}</span>{" "}
              <span className="text-muted-foreground">Active This Week</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Moderation</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingNominations}</div>
          <p className="text-xs text-muted-foreground">Pending Actions</p>
          <div className="mt-4 space-y-1">
            <div className="text-sm">
              <span className="font-medium">{stats.pendingStrikes}</span>{" "}
              <span className="text-muted-foreground">Strikes to Review</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">{stats.pendingAppeals}</span>{" "}
              <span className="text-muted-foreground">Appeals</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

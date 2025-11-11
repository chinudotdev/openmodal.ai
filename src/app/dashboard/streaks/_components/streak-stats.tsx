import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, CheckCircle2 } from "lucide-react";

interface StreakStatsProps {
  activityStreak: { currentStreak: number; longestStreak: number };
  verificationStreak: { currentStreak: number; longestStreak: number };
}

export function StreakStats({ activityStreak, verificationStreak }: StreakStatsProps) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activity Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activityStreak.currentStreak}</div>
          <p className="text-xs text-muted-foreground">
            Longest: {activityStreak.longestStreak} days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verification Streak</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{verificationStreak.currentStreak}</div>
          <p className="text-xs text-muted-foreground">
            Longest: {verificationStreak.longestStreak} correct
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Milestone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {activityStreak.currentStreak < 7
              ? "7 days"
              : activityStreak.currentStreak < 30
                ? "30 days"
                : "Complete!"}
          </div>
          <p className="text-xs text-muted-foreground">
            {activityStreak.currentStreak < 7
              ? `${7 - activityStreak.currentStreak} days to go`
              : activityStreak.currentStreak < 30
                ? `${30 - activityStreak.currentStreak} days to go`
                : "All milestones reached"}
          </p>
        </CardContent>
      </Card>
    </>
  );
}


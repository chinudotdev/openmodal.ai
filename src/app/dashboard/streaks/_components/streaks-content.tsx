import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserStreaks, getStreakCalendar } from "@/actions/gamification";
import { StreakCalendar } from "./streak-calendar";
import { StreakStats } from "./streak-stats";
import { Card, CardContent } from "@/components/ui/card";

export async function StreaksContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackURL=/dashboard/streaks");
  }

  const streaks = await getUserStreaks(session.user.id);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const calendarData = await getStreakCalendar(
    session.user.id,
    currentYear,
    currentMonth,
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your Activity Streaks</h1>
        <p className="text-muted-foreground mt-1">
          Track your daily activity and maintain your streaks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <StreakStats
          activityStreak={streaks.activityStreak}
          verificationStreak={streaks.verificationStreak}
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <StreakCalendar
            year={currentYear}
            month={currentMonth}
            activityDates={calendarData}
            currentStreak={streaks.activityStreak.currentStreak}
          />
        </CardContent>
      </Card>
    </div>
  );
}


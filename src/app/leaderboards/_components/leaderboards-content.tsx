import { headers } from "next/headers";
import {
  getLeaderboard,
  getUserLeaderboardPosition,
} from "@/actions/leaderboards";
import { auth } from "@/lib/auth";
import { LeaderboardList } from "./leaderboard-list";
import { LeaderboardTabs } from "./leaderboard-tabs";
import { UserPositionCard } from "./user-position-card";

interface LeaderboardsContentProps {
  promiseSearchParams: Promise<{ type?: string }>;
}

export async function LeaderboardsContent({
  promiseSearchParams,
}: LeaderboardsContentProps) {
  const searchParams = await promiseSearchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const type =
    (searchParams.type as
      | "monthly_contributors"
      | "monthly_verifiers"
      | "rising_stars"
      | "all_time") || "monthly_contributors";

  const leaderboard = await getLeaderboard(type, session?.user.id);
  const userPosition = session?.user.id
    ? await getUserLeaderboardPosition(type, session.user.id)
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🏆 Community Leaderboards</h1>
        <p className="text-muted-foreground mt-1">Updated hourly</p>
      </div>

      <LeaderboardTabs currentType={type} />

      <div className="mt-6">
        <LeaderboardList
          leaderboard={leaderboard}
          type={type}
          currentUserId={session?.user.id}
        />
      </div>

      {userPosition && (
        <div className="mt-6">
          <UserPositionCard position={userPosition} type={type} />
        </div>
      )}
    </div>
  );
}

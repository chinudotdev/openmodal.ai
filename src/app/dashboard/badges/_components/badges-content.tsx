import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserDashboard } from "@/actions/dashboard";
import { getPinnedBadges } from "@/actions/gamification";
import { auth } from "@/lib/auth";
import { BadgeCollection } from "./badge-collection";
import { PinnedBadgesSection } from "./pinned-badges-section";

export async function BadgesContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackURL=/dashboard/badges");
  }

  const data = await getUserDashboard(session.user.id);
  const pinnedBadges = await getPinnedBadges(session.user.id);

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Failed to load badges</p>
      </div>
    );
  }

  const earnedCount = data.badges.length;
  // TODO: Calculate total available badges
  const totalBadges = 40; // Placeholder

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your Badge Collection</h1>
        <p className="text-muted-foreground mt-1">
          {earnedCount} earned • {totalBadges - earnedCount} to discover
        </p>
      </div>

      <PinnedBadgesSection
        pinnedBadges={pinnedBadges}
        totalBadges={data.badges}
      />

      <BadgeCollection badges={data.badges} />
    </div>
  );
}

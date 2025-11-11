"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { LeaderboardCard } from "./leaderboard-card";

interface LeaderboardEntry {
  userId: string;
  name: string;
  image: string | null;
  role: string | null;
  points: number;
  count: number;
  rank: number;
}

interface LeaderboardListProps {
  leaderboard: LeaderboardEntry[];
  type: string;
  currentUserId?: string;
}

export function LeaderboardList({
  leaderboard,
  type,
  currentUserId,
}: LeaderboardListProps) {
  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No data available yet</p>
        </CardContent>
      </Card>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getCountLabel = (type: string) => {
    switch (type) {
      case "monthly_contributors":
        return "reports this month";
      case "monthly_verifiers":
        return "verifications this month";
      case "rising_stars":
        return "points gained in the last 30 days";
      case "all_time":
        return "points gained overall";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((entry, index) => (
            <LeaderboardCard
              key={entry.userId}
              entry={entry}
              position={index + 1}
              type={type}
              isCurrentUser={
                currentUserId ? entry.userId === currentUserId : false
              }
            />
          ))}
        </div>
      )}

      {/* Rest of the leaderboard */}
      {rest.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {rest.map((entry) => {
                const initials =
                  entry.name
                    .split(" ")
                    .filter(Boolean)
                    .map((segment) => segment[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "U";

                return (
                  <Link
                    key={entry.userId}
                    href={`/users/${entry.userId}`}
                    className="flex items-center gap-4 p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-lg font-semibold w-8 text-center">
                        {entry.rank}
                      </span>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.image || ""} alt={entry.name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{entry.name}</p>
                          {entry.role && (
                            <Badge variant="outline" className="text-xs">
                              {entry.role}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {entry.count} {getCountLabel(type)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {entry.points.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          reputation points
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

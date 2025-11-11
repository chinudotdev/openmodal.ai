"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Medal, Trophy, Award } from "lucide-react";
import Link from "next/link";

interface LeaderboardEntry {
  userId: string;
  name: string;
  image: string | null;
  role: string | null;
  points: number;
  count: number;
  rank: number;
}

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  position: number;
  type: string;
  isCurrentUser: boolean;
}

export function LeaderboardCard({
  entry,
  position,
  type,
  isCurrentUser,
}: LeaderboardCardProps) {
  const getMedalIcon = (pos: number) => {
    switch (pos) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPositionLabel = (pos: number) => {
    switch (pos) {
      case 1:
        return "1st Place";
      case 2:
        return "2nd Place";
      case 3:
        return "3rd Place";
      default:
        return `${pos}th Place`;
    }
  };

  const getCountLabel = (type: string) => {
    switch (type) {
      case "monthly_contributors":
        return "verified reports this month";
      case "monthly_verifiers":
        return "verifications";
      default:
        return "points";
    }
  };

  const initials = entry.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <Card
      className={`relative overflow-hidden ${
        isCurrentUser ? "ring-2 ring-primary" : ""
      } ${position === 1 ? "border-yellow-500" : ""}`}
    >
      {position <= 3 && (
        <div className="absolute top-2 right-2">
          {getMedalIcon(position)}
        </div>
      )}
      <CardContent className="p-6">
        <Link
          href={`/users/${entry.userId}`}
          className="flex flex-col items-center gap-4"
        >
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {getPositionLabel(position)}
            </p>
            <Avatar className="h-16 w-16 mx-auto mb-2">
              <AvatarImage src={entry.image || ""} alt={entry.name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <p className="font-semibold text-lg">{entry.name}</p>
            {entry.role && (
              <Badge variant="outline" className="mt-1">
                {entry.role}
              </Badge>
            )}
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              {entry.count} {getCountLabel(type)}
            </p>
            <p className="text-lg font-bold">{entry.points.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">reputation points</p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}


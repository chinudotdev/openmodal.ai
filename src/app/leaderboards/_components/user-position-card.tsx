"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserPositionCardProps {
  position: {
    rank: number;
    total: number;
    context?: string;
  };
  type: string;
}

export function UserPositionCard({ position, type }: UserPositionCardProps) {
  if (position.rank === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Position</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You're not in the top 100 yet. Keep contributing to climb the
            leaderboard!
          </p>
        </CardContent>
      </Card>
    );
  }

  const percentage = Math.round((position.rank / position.total) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Position</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-2xl font-bold">#{position.rank}</p>
          <p className="text-sm text-muted-foreground">
            out of {position.total} contributors
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">
            You're in the top {percentage}%!
          </p>
        </div>
        {position.context && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              {position.context}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


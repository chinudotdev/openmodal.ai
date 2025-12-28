import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EngagementMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Avg session length</p>
          <p className="text-2xl font-bold">12.3 minutes</p>
        </div>
        <div>
          <p className="text-sm font-medium">Avg reports per user</p>
          <p className="text-2xl font-bold">0.52</p>
        </div>
        <div>
          <p className="text-sm font-medium">Verification completion rate</p>
          <p className="text-2xl font-bold">81%</p>
        </div>
        <div>
          <p className="text-sm font-medium">Return user rate (weekly)</p>
          <p className="text-2xl font-bold">67%</p>
        </div>
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Daily active users: 342 (14.6% of total)
          </p>
          <p className="text-sm text-muted-foreground">
            Weekly active users: 789 (33.6% of total)
          </p>
          <p className="text-sm text-muted-foreground">
            Monthly active users: 1,456 (62% of total)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


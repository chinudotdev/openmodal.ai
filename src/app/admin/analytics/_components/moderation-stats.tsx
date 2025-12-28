import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ModerationStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderation Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Reports flagged</p>
            <p className="text-2xl font-bold">45</p>
            <p className="text-xs text-muted-foreground">3.6% of total</p>
          </div>
          <div>
            <p className="text-sm font-medium">Disputes filed</p>
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">0.9% of total</p>
          </div>
          <div>
            <p className="text-sm font-medium">Strikes issued</p>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-muted-foreground">3 yellow, 5 red</p>
          </div>
          <div>
            <p className="text-sm font-medium">Users banned</p>
            <p className="text-2xl font-bold">5</p>
            <p className="text-xs text-muted-foreground">3 temporary, 2 permanent</p>
          </div>
        </div>
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Avg moderation response time: 4.2 hours
          </p>
          <p className="text-sm text-muted-foreground">
            Appeals success rate: 40%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


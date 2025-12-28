import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Users, Shield, FileText } from "lucide-react";
import Link from "next/link";
import type { ActionRequired as ActionRequiredType } from "@/actions/admin";

interface ActionRequiredProps {
  data: ActionRequiredType;
}

export function ActionRequired({ data }: ActionRequiredProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Action Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.nominations > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{data.nominations} Moderator Nominations Pending</p>
                <p className="text-sm text-muted-foreground">Review nominations</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/moderation/nominations">Review →</Link>
            </Button>
          </div>
        )}

        {data.appeals > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{data.appeals} User Appeals to Review</p>
                <p className="text-sm text-muted-foreground">Review appeals</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/moderation/appeals">Review →</Link>
            </Button>
          </div>
        )}

        {data.strikes > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{data.strikes} Moderator Strikes to Address</p>
                <p className="text-sm text-muted-foreground">Review strikes</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/moderation/strikes">Review →</Link>
            </Button>
          </div>
        )}

        {data.flaggedReports > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{data.flaggedReports} Flagged Reports Need Admin Review</p>
                <p className="text-sm text-muted-foreground">Review reports</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/reports">Review →</Link>
            </Button>
          </div>
        )}

        {data.nominations === 0 && data.appeals === 0 && data.strikes === 0 && data.flaggedReports === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No actions required at this time
          </p>
        )}
      </CardContent>
    </Card>
  );
}


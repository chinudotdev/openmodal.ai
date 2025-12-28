import { AlertTriangle, Ban, BarChart3, Settings, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/admin/users">
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/admin/users">
            <Ban className="mr-2 h-4 w-4" />
            Ban User
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/admin/moderation">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Issue Strike
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/admin/analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/admin/settings">
            <Settings className="mr-2 h-4 w-4" />
            Platform Settings
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

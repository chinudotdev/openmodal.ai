import { Card, CardContent } from "@/components/ui/card";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jobs Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage job listings and automation risk data
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Jobs management interface coming soon. This will allow you to add, edit, and delete jobs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


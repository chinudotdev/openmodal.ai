import { Card, CardContent } from "@/components/ui/card";

export default function TagsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tags Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage content tags
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Tags management interface coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


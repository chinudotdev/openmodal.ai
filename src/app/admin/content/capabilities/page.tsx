import { Card, CardContent } from "@/components/ui/card";

export default function CapabilitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Capabilities Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage AI capabilities and progress tracking
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Capabilities management interface coming soon. This will allow you
            to add, edit, and update capability progress.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Categories Management</h1>
        <p className="text-muted-foreground mt-1">
          Organize content with categories
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Categories management interface coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

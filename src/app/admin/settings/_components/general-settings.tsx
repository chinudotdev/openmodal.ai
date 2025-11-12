"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";

export function GeneralSettings() {
  const [platformName, setPlatformName] = useState("OpenModal");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    // TODO: Implement save
    toast.success("Settings saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="platform-name">Platform Name</Label>
          <Input
            id="platform-name"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="description">Platform Description</Label>
          <Input
            id="description"
            placeholder="Track AI's real impact on jobs..."
            className="mt-2"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="maintenance"
            checked={maintenanceMode}
            onCheckedChange={(checked) => setMaintenanceMode(checked === true)}
          />
          <Label htmlFor="maintenance">Enable maintenance mode</Label>
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardContent>
    </Card>
  );
}


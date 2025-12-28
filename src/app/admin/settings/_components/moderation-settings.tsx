"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ModerationSettings() {
  const handleSave = () => {
    toast.success("Moderation settings saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderation Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-4">Strike thresholds</h3>
          <div className="space-y-2">
            <div>
              <Label>Yellow strikes before red</Label>
              <Input type="number" defaultValue={2} className="mt-1" />
            </div>
            <div>
              <Label>Red strikes before removal</Label>
              <Input type="number" defaultValue={2} className="mt-1" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">Auto-moderation</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="auto-flag-duplicates" defaultChecked />
              <Label htmlFor="auto-flag-duplicates">
                Auto-flag duplicate reports
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="auto-flag-broken-links" defaultChecked />
              <Label htmlFor="auto-flag-broken-links">
                Auto-flag reports with broken links
              </Label>
            </div>
          </div>
        </div>

        <Button onClick={handleSave}>Save Moderation Settings</Button>
      </CardContent>
    </Card>
  );
}

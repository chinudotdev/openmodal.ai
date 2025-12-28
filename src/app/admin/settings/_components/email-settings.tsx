"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export function EmailSettings() {
  const handleSave = () => {
    toast.success("Email settings saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-4">Admin alerts</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="alert-nominations" defaultChecked />
              <Label htmlFor="alert-nominations">New Moderator nomination</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="alert-appeals" defaultChecked />
              <Label htmlFor="alert-appeals">Strike appeal submitted</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="alert-flagged" defaultChecked />
              <Label htmlFor="alert-flagged">Flagged report needs review</Label>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="admin-email">Admin email(s)</Label>
          <Input
            id="admin-email"
            type="email"
            placeholder="admin@openmodal.com"
            className="mt-2"
          />
        </div>

        <Button onClick={handleSave}>Save Email Settings</Button>
      </CardContent>
    </Card>
  );
}


"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RoleRequirements() {
  const handleSave = () => {
    toast.success("Role requirements saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Requirements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-4">Observer → Contributor</h3>
          <div className="space-y-2">
            <div>
              <Label>Verified reports needed</Label>
              <Input type="number" defaultValue={3} className="mt-1" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">Contributor → Expert</h3>
          <div className="space-y-2">
            <div>
              <Label>Verified reports</Label>
              <Input type="number" defaultValue={15} className="mt-1" />
            </div>
            <div>
              <Label>Reputation points</Label>
              <Input type="number" defaultValue={100} className="mt-1" />
            </div>
            <div>
              <Label>Account age (days)</Label>
              <Input type="number" defaultValue={30} className="mt-1" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">Expert → Moderator</h3>
          <div className="space-y-2">
            <div>
              <Label>Verifications</Label>
              <Input type="number" defaultValue={50} className="mt-1" />
            </div>
            <div>
              <Label>Accuracy rate (%)</Label>
              <Input type="number" defaultValue={85} className="mt-1" />
            </div>
            <div>
              <Label>Reputation points</Label>
              <Input type="number" defaultValue={500} className="mt-1" />
            </div>
            <div>
              <Label>Days active</Label>
              <Input type="number" defaultValue={90} className="mt-1" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="require-admin" defaultChecked />
              <Label htmlFor="require-admin">Require Admin approval</Label>
            </div>
          </div>
        </div>

        <Button onClick={handleSave}>Save Requirements</Button>
      </CardContent>
    </Card>
  );
}

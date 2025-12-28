"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function GamificationSettings() {
  const handleSave = () => {
    toast.success("Gamification settings saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gamification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-4">Points per action</h3>
          <div className="space-y-2">
            <div>
              <Label>Report submitted</Label>
              <Input type="number" defaultValue={5} className="mt-1" />
            </div>
            <div>
              <Label>Report verified</Label>
              <Input type="number" defaultValue={15} className="mt-1" />
            </div>
            <div>
              <Label>Verification completed</Label>
              <Input type="number" defaultValue={10} className="mt-1" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">Streak bonuses</h3>
          <div className="space-y-2">
            <div>
              <Label>7-day streak</Label>
              <Input type="number" defaultValue={20} className="mt-1" />
            </div>
            <div>
              <Label>30-day streak</Label>
              <Input type="number" defaultValue={100} className="mt-1" />
            </div>
          </div>
        </div>

        <Button onClick={handleSave}>Save Gamification Settings</Button>
      </CardContent>
    </Card>
  );
}


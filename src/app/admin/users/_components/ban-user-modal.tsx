"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { UserListResult } from "@/actions/admin-users";
import { banUser, unbanUser } from "@/actions/admin-users";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface BanUserModalProps {
  user: UserListResult["users"][0];
  onClose: () => void;
  isBanned: boolean;
}

export function BanUserModal({ user, onClose, isBanned }: BanUserModalProps) {
  const queryClient = useQueryClient();
  const [banDuration, setBanDuration] = useState<string>("permanent");
  const [customDays, setCustomDays] = useState<string>("");
  const [banReason, setBanReason] = useState<string>("");
  const [notifyUser, setNotifyUser] = useState(true);

  const banMutation = useMutation({
    mutationFn: (data: {
      duration: number | null;
      reason: string;
      notifyUser: boolean;
    }) => banUser(user.id, data),
    onSuccess: () => {
      toast.success(isBanned ? "User unbanned" : "User banned");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onClose();
    },
    onError: () => {
      toast.error(`Failed to ${isBanned ? "unban" : "ban"} user`);
    },
  });

  const unbanMutation = useMutation({
    mutationFn: () => unbanUser(user.id),
    onSuccess: () => {
      toast.success("User unbanned");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to unban user");
    },
  });

  const handleSubmit = () => {
    if (isBanned) {
      unbanMutation.mutate();
      return;
    }

    if (!banReason.trim()) {
      toast.error("Ban reason is required");
      return;
    }

    let duration: number | null = null;
    if (banDuration === "custom") {
      const days = parseInt(customDays);
      if (isNaN(days) || days <= 0) {
        toast.error("Please enter a valid number of days");
        return;
      }
      duration = days;
    } else if (banDuration !== "permanent") {
      duration = parseInt(banDuration);
    }

    banMutation.mutate({
      duration,
      reason: banReason,
      notifyUser,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isBanned ? "Unban User" : "Ban User"}</DialogTitle>
        </DialogHeader>

        {isBanned ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You're about to unban: <strong>{user.name}</strong> ({user.email})
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSubmit}
                disabled={unbanMutation.isPending}
              >
                {unbanMutation.isPending ? "Unbanning..." : "Confirm Unban"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                You're about to ban: <strong>{user.name}</strong> ({user.email})
              </p>

              <div className="space-y-4">
                <div>
                  <Label>Ban Duration</Label>
                  <RadioGroup
                    value={banDuration}
                    onValueChange={setBanDuration}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="24h" />
                      <Label htmlFor="24h">24 hours</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="7" id="7d" />
                      <Label htmlFor="7d">7 days</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="30" id="30d" />
                      <Label htmlFor="30d">30 days</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="permanent" id="permanent" />
                      <Label htmlFor="permanent">Permanent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom">Custom:</Label>
                      <Input
                        type="number"
                        placeholder="days"
                        className="w-24"
                        value={customDays}
                        onChange={(e) => setCustomDays(e.target.value)}
                        disabled={banDuration !== "custom"}
                      />
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="reason">Ban Reason (required)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Enter the reason for banning this user..."
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {banReason.length}/500 characters
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify"
                    checked={notifyUser}
                    onCheckedChange={(checked) =>
                      setNotifyUser(checked === true)
                    }
                  />
                  <Label htmlFor="notify">Notify user via email</Label>
                </div>

                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  ⚠️ This action cannot be undone easily.
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={banMutation.isPending || !banReason.trim()}
              >
                {banMutation.isPending ? "Banning..." : "Confirm Ban"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

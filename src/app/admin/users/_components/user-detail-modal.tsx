"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { changeUserRole, getUserDetails } from "@/actions/admin-users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

interface UserDetailModalProps {
  userId: string;
  onClose: () => void;
}

export function UserDetailModal({ userId, onClose }: UserDetailModalProps) {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["user-details", userId],
    queryFn: () => getUserDetails(userId),
  });

  const changeRoleMutation = useMutation({
    mutationFn: (newRole: string) => changeUserRole(userId, newRole),
    onSuccess: () => {
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: ["user-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => {
      toast.error("Failed to update user role");
    },
  });

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-12">
            <Spinner className="h-8 w-8" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!data) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Not Found</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const { user, reputation, profile, stats } = data;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details: {user.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              {user.username && (
                <div>
                  <p className="text-sm font-medium">Username</p>
                  <p className="text-sm text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {user.id}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {user.banned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge variant="outline">Active</Badge>
                  )}
                  {user.emailVerified && (
                    <Badge variant="outline">Email Verified</Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Joined</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Active</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge>{user.role || "observer"}</Badge>
              </div>
              <div className="flex gap-2">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Change to..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="observer">Observer</SelectItem>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="trusted">Trusted</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    if (selectedRole) {
                      changeRoleMutation.mutate(selectedRole);
                      setSelectedRole("");
                    }
                  }}
                  disabled={!selectedRole || changeRoleMutation.isPending}
                >
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>

          {reputation && (
            <Card>
              <CardHeader>
                <CardTitle>Reputation & Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Reputation Points</p>
                  <p className="text-sm text-muted-foreground">
                    {reputation.reputationPoints}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Tier</p>
                  <p className="text-sm text-muted-foreground">
                    {reputation.tier}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Reports Submitted</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.reportsCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Verifications Completed</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.verificationsCount}
                  </p>
                </div>
                {stats.strikesCount > 0 && (
                  <div>
                    <p className="text-sm font-medium">Strikes</p>
                    <p className="text-sm text-destructive">
                      {stats.strikesCount}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {user.banned && (
            <Card>
              <CardHeader>
                <CardTitle>Ban Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Ban Reason</p>
                  <p className="text-sm text-muted-foreground">
                    {user.banReason}
                  </p>
                </div>
                {user.banExpires && (
                  <div>
                    <p className="text-sm font-medium">Ban Expires</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.banExpires).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

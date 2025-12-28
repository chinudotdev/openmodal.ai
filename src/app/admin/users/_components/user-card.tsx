"use client";

import { AlertTriangle, CheckCircle, User } from "lucide-react";
import { useState } from "react";
import type { UserListResult } from "@/actions/admin-users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BanUserModal } from "./ban-user-modal";
import { UserDetailModal } from "./user-detail-modal";

interface UserCardProps {
  user: UserListResult["users"][0];
}

export function UserCard({ user }: UserCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "moderator":
        return "default";
      case "expert":
        return "secondary";
      case "contributor":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">{user.name}</h3>
                {user.banned && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    BANNED
                  </Badge>
                )}
                {user.role && (
                  <Badge variant={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
              {user.username && (
                <p className="text-xs text-muted-foreground mb-2">
                  @{user.username}
                </p>
              )}
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>ID: {user.id.slice(0, 12)}...</span>
                <span>
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </span>
                <span>
                  Last active: {new Date(user.updatedAt).toLocaleDateString()}
                </span>
              </div>
              {user.reputation && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">
                    {user.reputation.reputationPoints}
                  </span>{" "}
                  <span className="text-muted-foreground">points</span> •{" "}
                  <span className="text-muted-foreground">
                    {user.stats.reportsCount} reports
                  </span>{" "}
                  •{" "}
                  <span className="text-muted-foreground">
                    {user.stats.verificationsCount} verifications
                  </span>
                  {user.stats.strikesCount > 0 && (
                    <>
                      {" "}
                      •{" "}
                      <span className="text-destructive">
                        {user.stats.strikesCount} strikes
                      </span>
                    </>
                  )}
                </div>
              )}
              {user.banned && user.banExpires && (
                <div className="mt-2 text-sm text-destructive">
                  Ban expires: {new Date(user.banExpires).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailModal(true)}
              >
                View Details
              </Button>
              {user.banned ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBanModal(true)}
                >
                  Unban
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowBanModal(true)}
                >
                  Ban User
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showDetailModal && (
        <UserDetailModal
          userId={user.id}
          onClose={() => setShowDetailModal(false)}
        />
      )}
      {showBanModal && (
        <BanUserModal
          user={user}
          onClose={() => setShowBanModal(false)}
          isBanned={user.banned}
        />
      )}
    </>
  );
}

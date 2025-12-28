"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pin, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { pinBadge, unpinBadge } from "@/actions/gamification";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { userBadge } from "@/db/schema";

interface BadgeDetailsModalProps {
  badge: typeof userBadge.$inferSelect;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BadgeDetailsModal({
  badge,
  open,
  onOpenChange,
}: BadgeDetailsModalProps) {
  const queryClient = useQueryClient();
  const isEarned = !!badge.earnedAt;

  const pinMutation = useMutation({
    mutationFn: async () => {
      if (badge.pinned) {
        return unpinBadge(badge.userId, badge.id);
      } else {
        return pinBadge(badge.userId, badge.id);
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["pinned-badges"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        toast.success(
          badge.pinned ? "Badge unpinned" : "Badge pinned to profile",
        );
      } else {
        toast.error(result.error || "Failed to update badge");
      }
    },
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `I earned the ${badge.badgeName} badge on OpenModal!`,
        text: badge.badgeDescription || "",
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `I earned the ${badge.badgeName} badge on OpenModal! ${badge.badgeDescription || ""}`,
      );
      toast.success("Badge info copied to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{badge.badgeName}</DialogTitle>
          <DialogDescription>
            {isEarned ? "You earned this badge!" : "Locked badge"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="text-6xl">{badge.badgeIcon || "🏅"}</div>

          {isEarned && badge.earnedAt && (
            <p className="text-sm text-muted-foreground">
              {new Date(badge.earnedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}

          {badge.badgeDescription && (
            <p className="text-sm text-center text-muted-foreground max-w-md">
              {badge.badgeDescription}
            </p>
          )}

          {badge.rarity && (
            <div className="text-sm">
              <span className="text-muted-foreground">Rarity: </span>
              <span className="font-medium">
                {badge.rarity} of users have this badge
              </span>
            </div>
          )}

          {isEarned && (
            <div className="flex gap-2 mt-4">
              <Button
                variant={badge.pinned ? "outline" : "default"}
                onClick={() => pinMutation.mutate()}
                disabled={pinMutation.isPending}
              >
                <Pin className="h-4 w-4 mr-2" />
                {badge.pinned ? "Unpin from profile" : "Pin to profile"}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share badge
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

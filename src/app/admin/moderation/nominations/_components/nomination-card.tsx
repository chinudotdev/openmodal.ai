"use client";

import type { NominationWithDetails } from "@/actions/admin-moderation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, User } from "lucide-react";
import { useState } from "react";
import { NominationReviewModal } from "./nomination-review-modal";

interface NominationCardProps {
  nomination: NominationWithDetails;
}

export function NominationCard({ nomination }: NominationCardProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case "expert":
        return "secondary";
      case "moderator":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Expert → Moderator Nomination
            </CardTitle>
            <Badge variant={getRoleBadgeColor(nomination.candidate.role)}>
              {nomination.candidate.role || "observer"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Candidate</p>
            <p className="text-sm text-muted-foreground">
              {nomination.candidate.name} ({nomination.candidate.email})
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Nominated by</p>
            <p className="text-sm text-muted-foreground">
              {nomination.nominator.name} (Moderator)
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Nominated</p>
            <p className="text-sm text-muted-foreground">
              {new Date(nomination.submittedAt).toLocaleDateString()}
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Qualifications</p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>
                  {nomination.candidateStats.verificationsCount} verifications
                  (need 50)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>
                  {nomination.candidateStats.reputationPoints} points (need 500)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>0 strikes</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Nomination Statement</p>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {nomination.statement}
            </p>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={() => setShowReviewModal(true)}
            >
              Read full statement →
            </Button>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(true)}
              className="flex-1"
            >
              Review Nomination
            </Button>
          </div>
        </CardContent>
      </Card>

      {showReviewModal && (
        <NominationReviewModal
          nomination={nomination}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  );
}

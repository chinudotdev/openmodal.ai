"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { NominationWithDetails } from "@/actions/admin-moderation";
import { reviewNomination } from "@/actions/admin-moderation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NominationReviewModalProps {
  nomination: NominationWithDetails;
  onClose: () => void;
}

export function NominationReviewModal({
  nomination,
  onClose,
}: NominationReviewModalProps) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);

  const reviewMutation = useMutation({
    mutationFn: async (decision: "approve" | "reject") => {
      return reviewNomination(nomination.id, decision, notes || null);
    },
    onSuccess: () => {
      toast.success(
        `Nomination ${decision === "approve" ? "approved" : "rejected"}`,
      );
      queryClient.invalidateQueries({ queryKey: ["moderator-nominations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to review nomination");
    },
  });

  const handleSubmit = () => {
    if (!decision) {
      toast.error("Please select a decision");
      return;
    }
    reviewMutation.mutate(decision);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Nomination</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Candidate</p>
            <p className="text-sm text-muted-foreground">
              {nomination.candidate.name} ({nomination.candidate.email})
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">Nomination Statement</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
              {nomination.statement}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Candidate Track Record</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                • {nomination.candidateStats.verificationsCount} verifications
              </p>
              <p>
                • {nomination.candidateStats.reportsCount} reports submitted
              </p>
              <p>
                • {nomination.candidateStats.reputationPoints} reputation points
              </p>
              <p>• {nomination.candidateStats.strikesCount} strikes</p>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Admin Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={() => {
                setDecision("approve");
                handleSubmit();
              }}
              disabled={reviewMutation.isPending}
              className="flex-1"
            >
              Approve & Promote
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDecision("reject");
                handleSubmit();
              }}
              disabled={reviewMutation.isPending}
              className="flex-1"
            >
              Reject with Reason
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  approveReportAction,
  rejectReport,
  requestReportChanges,
} from "@/actions/moderation";
import { getReportById } from "@/actions/reports";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/contexts/session-context";
import { formatDistanceToNow } from "@/lib/date-utils";

interface ModerationReportDetailProps {
  reportId: string;
  onBack: () => void;
}

export function ModerationReportDetail({
  reportId,
  onBack,
}: ModerationReportDetailProps) {
  const router = useRouter();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRequestChangesDialog, setShowRequestChangesDialog] =
    useState(false);
  const [moderationNotes, setModerationNotes] = useState("");
  const [moderationReason, setModerationReason] = useState("");

  const { data: report, isLoading } = useQuery({
    queryKey: ["moderation-report", reportId],
    queryFn: () => getReportById(reportId),
  });

  const approveMutation = useMutation({
    mutationFn: () => {
      if (!user?.id)
        return Promise.resolve({ success: false, error: "Not authenticated" });
      return approveReportAction(user.id, {
        reportId,
        moderationNotes: moderationNotes || undefined,
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(
          `Report approved! +${result.pointsAwarded} points awarded to author.`,
        );
        queryClient.invalidateQueries({ queryKey: ["moderation-stats"] });
        queryClient.invalidateQueries({ queryKey: ["moderation-pending"] });
        router.refresh();
        onBack();
      } else {
        toast.error(result.error || "Failed to approve report");
      }
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => {
      if (!user?.id)
        return Promise.resolve({ success: false, error: "Not authenticated" });
      return rejectReport(user.id, {
        reportId,
        moderationReason,
        moderationNotes: moderationNotes || undefined,
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Report rejected.");
        queryClient.invalidateQueries({ queryKey: ["moderation-stats"] });
        queryClient.invalidateQueries({ queryKey: ["moderation-pending"] });
        router.refresh();
        onBack();
      } else {
        toast.error(result.error || "Failed to reject report");
      }
    },
  });

  const requestChangesMutation = useMutation({
    mutationFn: () => {
      if (!user?.id)
        return Promise.resolve({ success: false, error: "Not authenticated" });
      return requestReportChanges(user.id, {
        reportId,
        moderationNotes,
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Changes requested.");
        queryClient.invalidateQueries({ queryKey: ["moderation-stats"] });
        queryClient.invalidateQueries({ queryKey: ["moderation-pending"] });
        router.refresh();
        onBack();
      } else {
        toast.error(result.error || "Failed to request changes");
      }
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Report not found</p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Queue
          </Button>
        </CardContent>
      </Card>
    );
  }

  const location =
    [report.city, report.stateProvince, report.country]
      .filter(Boolean)
      .join(", ") ||
    report.location ||
    "Location not specified";
  const postedAgo = report.createdAt
    ? formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })
    : "Unknown";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Queue
        </Button>
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={() => setShowApproveDialog(true)}
            disabled={approveMutation.isPending}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowRequestChangesDialog(true)}
            disabled={requestChangesMutation.isPending}
          >
            <FileText className="h-4 w-4 mr-2" />
            Request Changes
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowRejectDialog(true)}
            disabled={rejectMutation.isPending}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {report.jobTitle || report.type || "Automation Report"}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary">{report.type}</Badge>
                <Badge variant="outline">{report.status}</Badge>
                <span className="text-sm text-muted-foreground">
                  Posted {postedAgo}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/reports/${report.id}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Job
              </Label>
              <p className="text-sm">{report.jobTitle || "Not specified"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Technology
              </Label>
              <p className="text-sm">{report.technology || "Not specified"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Company
              </Label>
              <p className="text-sm">{report.company || "Not specified"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Location
              </Label>
              <p className="text-sm">{location}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Description
            </Label>
            <p className="text-sm leading-6 text-muted-foreground whitespace-pre-wrap mt-1">
              {report.description}
            </p>
          </div>

          {report.evidence && report.evidence.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Evidence
              </Label>
              <div className="space-y-2 mt-1">
                {report.evidence.map((evidence) => {
                  const url = evidence.url || evidence.fileUrl;
                  if (!url) return null;
                  return (
                    <a
                      key={evidence.id}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      {url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Upvotes
              </Label>
              <p className="text-sm">{report.upvotes || 0}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Downvotes
              </Label>
              <p className="text-sm">{report.downvotes || 0}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Verifications
              </Label>
              <p className="text-sm">{report.verificationCount || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Report</DialogTitle>
            <DialogDescription>
              This report will be published and the author will receive
              reputation points.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approve-notes">
                Moderation Notes (Optional, Internal)
              </Label>
              <Textarea
                id="approve-notes"
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                placeholder="Add internal notes about this approval..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                approveMutation.mutate();
                setShowApproveDialog(false);
              }}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? "Approving..." : "Approve Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Report</DialogTitle>
            <DialogDescription>
              This report will be rejected and the author will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Rejection Reason (Public)</Label>
              <Textarea
                id="reject-reason"
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="Explain why this report is being rejected..."
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="reject-notes">
                Moderation Notes (Optional, Internal)
              </Label>
              <Textarea
                id="reject-notes"
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                placeholder="Add internal notes about this rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!moderationReason.trim()) {
                  toast.error("Please provide a rejection reason");
                  return;
                }
                rejectMutation.mutate();
                setShowRejectDialog(false);
              }}
              disabled={rejectMutation.isPending || !moderationReason.trim()}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Dialog */}
      <Dialog
        open={showRequestChangesDialog}
        onOpenChange={setShowRequestChangesDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              The author will be notified and can update the report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="changes-notes">
                Changes Requested (Required)
              </Label>
              <Textarea
                id="changes-notes"
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                placeholder="Describe what changes are needed..."
                rows={5}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRequestChangesDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!moderationNotes.trim()) {
                  toast.error("Please describe what changes are needed");
                  return;
                }
                requestChangesMutation.mutate();
                setShowRequestChangesDialog(false);
              }}
              disabled={
                requestChangesMutation.isPending || !moderationNotes.trim()
              }
            >
              {requestChangesMutation.isPending
                ? "Requesting..."
                : "Request Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

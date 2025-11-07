"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Award,
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Cpu,
  ExternalLink,
  Flag,
  MapPin,
  MessageSquare,
  ShieldCheck,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { VerificationModal } from "@/components/reports/verification-modal";
import { DisputeModal } from "@/components/reports/dispute-modal";
import { voteReport, getUserVote } from "@/actions/votes";
import { useSession } from "@/contexts/session-context";
import { formatDistanceToNow } from "@/lib/date-utils";
import { ReportCommentSection } from "./comment-section";

export type ReportDetail = NonNullable<
  Awaited<ReturnType<typeof import("@/actions/reports").getReportById>>
>;
export type ReportVerificationList = Awaited<
  ReturnType<typeof import("@/actions/verifications").getReportVerifications>
>;

interface ReportDetailContentProps {
  report: ReportDetail;
  verifications: ReportVerificationList;
}

interface DetailItemProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium leading-5 text-foreground">{value}</p>
      </div>
    </div>
  );
}

const numberFormatter = new Intl.NumberFormat("en-US");

const tierLabels: Record<string, string> = {
  observer: "Observer",
  contributor: "Contributor",
  trusted: "Trusted",
  expert: "Expert",
};

const deploymentStatusLabels: Record<string, string> = {
  fully_deployed: "Fully Deployed",
  pilot: "Pilot Phase",
  announced: "Announced",
  failed: "Deployment Failed",
};

const impactTypeLabels: Record<string, string> = {
  completely_replaced: "Workers completely replaced",
  partially_replaced: "Headcount reduced",
  augmented: "Workers augmented",
  no_job_loss: "No job loss yet",
};

const performanceLabels: Record<string, string> = {
  better_than_humans: "Better than humans",
  about_same: "About the same as humans",
  worse_improving: "Worse but improving",
  worse_not_improving: "Worse, not improving",
};

const verificationSourceLabels: Record<string, string> = {
  work_at_company: "Worked at this company",
  direct_knowledge: "Direct knowledge",
  additional_evidence: "Found additional evidence",
  industry_insider: "Industry insider knowledge",
  other: "Other source",
};

const moderationStatusLabels: Record<string, string> = {
  draft: "Draft",
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  changes_requested: "Changes Requested",
};

function formatNumber(value: number | null | undefined) {
  return value == null ? "—" : numberFormatter.format(value);
}

function formatPercentage(value: number | null | undefined) {
  return value == null ? "—" : `${value}%`;
}

function formatMonthYear(value: Date | string | null | undefined) {
  if (!value) return "Not specified";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function ensureHandle(value?: string | null) {
  if (!value) return null;
  return value.startsWith("@") ? value : `@${value}`;
}

function getInitials(value: string) {
  const clean = value.replace(/@/g, "").trim();
  if (!clean) return "??";
  const parts = clean.split(/\s+/);
  const initials = parts
    .map((part) => part.charAt(0).toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");
  return initials || clean.slice(0, 2).toUpperCase();
}

export function ReportDetailContent({
  report,
  verifications,
}: ReportDetailContentProps) {
  const router = useRouter();
  const { user, isLoading: isSessionLoading } = useSession();

  // Fetch user vote - must be called unconditionally
  const { data: userVote, isLoading: isVoteLoading } = useQuery({
    queryKey: ["user-vote", report.id, user?.id],
    queryFn: () => {
      if (!user?.id) {
        return null;
      }
      return getUserVote(report.id, user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showAllVerifications, setShowAllVerifications] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const [upvotes, setUpvotes] = useState(report.upvotes ?? 0);
  const [downvotes, setDownvotes] = useState(report.downvotes ?? 0);
  const [userVoteType, setUserVoteType] = useState<"up" | "down" | null>(null);

  // Update userVoteType when userVote changes
  useEffect(() => {
    if (userVote) {
      setUserVoteType(
        userVote.voteType === "up" || userVote.voteType === "down"
          ? userVote.voteType
          : null,
      );
    } else {
      setUserVoteType(null);
    }
  }, [userVote]);

  const userId = user?.id;
  const hasVerified = userId
    ? verifications.some((verification) => verification.userId === userId)
    : false;
  const isCommunityVerified = (report.verificationCount || 0) >= 3;

  // All hooks must be called before any conditional returns
  const authorHandle = useMemo(() => {
    return (
      ensureHandle(report.author?.displayUsername) ||
      ensureHandle(report.author?.username) ||
      ensureHandle(report.userId) ||
      "@unknown"
    );
  }, [report.author?.displayUsername, report.author?.username, report.userId]);

  // Show loading state while session is loading
  if (isSessionLoading || isVoteLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const authorTier = report.authorReputation?.tier
    ? (tierLabels[report.authorReputation.tier] ?? report.authorReputation.tier)
    : undefined;

  const authorReputationPoints =
    report.authorReputation?.reputationPoints ?? null;
  const authorBadges = report.authorBadges ?? [];

  const locationLabel =
    [report.city, report.stateProvince, report.country]
      .filter(Boolean)
      .join(", ") ||
    report.location ||
    "Location not specified";

  const postedAgo = report.createdAt
    ? formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })
    : "Unknown";

  const deploymentStatusLabel = report.deploymentStatus
    ? (deploymentStatusLabels[report.deploymentStatus] ??
      report.deploymentStatus)
    : undefined;

  const moderationStatusLabel =
    moderationStatusLabels[report.status] ?? report.status;

  const impactLabel = report.impactType
    ? (impactTypeLabels[report.impactType] ?? report.impactType)
    : undefined;

  const performanceLabel = report.performanceComparison
    ? (performanceLabels[report.performanceComparison] ??
      report.performanceComparison)
    : undefined;

  const verificationsToRender = showAllVerifications
    ? verifications
    : verifications.slice(0, 3);
  const canExpandVerifications = verifications.length > 3;

  const handleVote = async (voteType: "up" | "down") => {
    if (isVoting || !userId) {
      if (!userId) {
        toast.error("Please sign in to vote");
        router.push("/login");
      }
      return;
    }
    setIsVoting(true);

    try {
      const result = await voteReport(userId, {
        reportId: report.id,
        voteType,
      });

      if (!result?.success) {
        toast.error(result?.error || "Failed to update vote");
        return;
      }

      if (userVoteType !== voteType) {
        if (voteType === "up") {
          setUpvotes((current) => current + 1);
          if (userVoteType === "down") {
            setDownvotes((current) => Math.max(0, current - 1));
          }
        } else {
          setDownvotes((current) => current + 1);
          if (userVoteType === "up") {
            setUpvotes((current) => Math.max(0, current - 1));
          }
        }
      }

      setUserVoteType(voteType);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update vote");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="order-2 md:order-1 md:w-28">
          <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm md:flex-col md:items-center md:justify-start md:gap-3">
            <Button
              aria-label="Upvote report"
              variant={userVoteType === "up" ? "default" : "outline"}
              size="icon"
              disabled={isVoting}
              onClick={() => handleVote("up")}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <div className="text-xl font-semibold leading-none">
              {formatNumber(upvotes)}
            </div>
            <Button
              aria-label="Downvote report"
              variant={userVoteType === "down" ? "default" : "outline"}
              size="icon"
              disabled={isVoting}
              onClick={() => handleVote("down")}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <div className="text-xs font-medium text-muted-foreground">
              {formatNumber(downvotes)} down
            </div>
          </div>
        </div>

        <div className="order-1 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="uppercase tracking-wide">
              {report.type === "deployment"
                ? "Deployment"
                : report.type === "barrier"
                  ? "Barrier"
                  : report.type === "research"
                    ? "Research"
                    : "Report"}
            </Badge>
            {moderationStatusLabel && (
              <Badge variant="outline">{moderationStatusLabel}</Badge>
            )}
            {deploymentStatusLabel && (
              <Badge variant="outline" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                {deploymentStatusLabel}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {report.jobTitle || report.type || "Automation Report"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>
                Posted by <span className="font-medium">{authorHandle}</span>
              </span>
              <span>• {postedAgo}</span>
              {authorTier && (
                <Badge variant="outline" className="gap-1">
                  <Award className="h-3 w-3" />
                  {authorTier}
                  {authorReputationPoints != null
                    ? ` (${formatNumber(authorReputationPoints)} rep)`
                    : ""}
                </Badge>
              )}
              {authorBadges.slice(0, 2).map((badge) => (
                <Badge key={badge.id} variant="secondary">
                  {badge.badgeName}
                </Badge>
              ))}
            </div>
          </div>

          {isCommunityVerified ? (
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Community Verified ({formatNumber(report.verificationCount || 0)}{" "}
              verifications)
            </div>
          ) : report.verificationCount ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              {formatNumber(report.verificationCount)} verification
              {report.verificationCount === 1 ? "" : "s"} from the community
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No verifications yet — help the community by verifying this
              report.
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" />
              {formatNumber(upvotes)} upvotes
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {formatNumber(report.verificationCount || 0)} verifications
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {formatNumber(report.commentCount || 0)} comments
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailItem
              icon={<Briefcase className="h-4 w-4" />}
              label="Job"
              value={report.jobTitle || "Not specified"}
            />
            <DetailItem
              icon={<Cpu className="h-4 w-4" />}
              label="Technology"
              value={report.technology || "Not specified"}
            />
            <DetailItem
              icon={<Building2 className="h-4 w-4" />}
              label="Company"
              value={report.company || "Not specified"}
            />
            <DetailItem
              icon={<MapPin className="h-4 w-4" />}
              label="Location"
              value={locationLabel}
            />
            <DetailItem
              icon={<CalendarDays className="h-4 w-4" />}
              label="Deployment Date"
              value={formatMonthYear(report.deploymentDate)}
            />
            <DetailItem
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Deployment Status"
              value={deploymentStatusLabel || "Not specified"}
            />
            <DetailItem
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Moderation Status"
              value={moderationStatusLabel || "Unknown"}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Impact Snapshot
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem
                icon={<Users className="h-4 w-4" />}
                label="Workers Affected"
                value={
                  report.workersAffected != null
                    ? `${formatNumber(report.workersAffected)} workers`
                    : "—"
                }
              />
              <DetailItem
                icon={<BarChart3 className="h-4 w-4" />}
                label="Automation Level"
                value={
                  report.automationPercentage != null
                    ? `${formatPercentage(report.automationPercentage)} of work automated`
                    : "—"
                }
              />
              <DetailItem
                icon={<Award className="h-4 w-4" />}
                label="Impact Type"
                value={impactLabel || "—"}
              />
              <DetailItem
                icon={<TrendingUp className="h-4 w-4" />}
                label="AI Performance"
                value={performanceLabel || "—"}
              />
            </div>
          </div>

          {report.description && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h3>
              <p className="text-sm leading-6 text-muted-foreground whitespace-pre-wrap">
                {report.description}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Evidence
            </h3>
            {report.evidence && report.evidence.length > 0 ? (
              <div className="space-y-2">
                {report.evidence.map((evidence) => {
                  const url = evidence.url || evidence.fileUrl;
                  if (!url) {
                    return null;
                  }
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
            ) : (
              <p className="text-sm text-muted-foreground">
                No evidence links were provided.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Verifications ({formatNumber(verifications.length)})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {verifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No verifications yet. Be the first to confirm this report.
            </p>
          ) : (
            <>
              <div className="space-y-4">
                {verificationsToRender.map((verification) => {
                  const verificationHandle =
                    ensureHandle(verification.user?.displayUsername) ||
                    ensureHandle(verification.user?.username) ||
                    ensureHandle(verification.userId) ||
                    "@anonymous";
                  const verificationDisplayName =
                    verification.profile?.displayName || verificationHandle;
                  const timeAgo = verification.createdAt
                    ? formatDistanceToNow(new Date(verification.createdAt), {
                        addSuffix: true,
                      })
                    : "";
                  const badges = verification.badges ?? [];

                  return (
                    <div
                      key={verification.id}
                      className="flex items-start gap-4 rounded-xl border bg-card p-4"
                    >
                      <Avatar className="h-12 w-12">
                        {verification.user?.image ? (
                          <AvatarImage
                            src={verification.user.image}
                            alt={verificationDisplayName}
                          />
                        ) : null}
                        <AvatarFallback>
                          {getInitials(verificationDisplayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {verificationDisplayName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {verificationHandle}
                          </span>
                          {verification.reputation?.tier && (
                            <Badge variant="outline" className="gap-1">
                              <Award className="h-3 w-3" />
                              {tierLabels[verification.reputation.tier] ??
                                verification.reputation.tier}
                              {verification.reputation.reputationPoints != null
                                ? ` (${formatNumber(verification.reputation.reputationPoints)} rep)`
                                : ""}
                            </Badge>
                          )}
                          {badges.slice(0, 2).map((badge) => (
                            <Badge key={badge.id} variant="secondary">
                              {badge.badgeName}
                            </Badge>
                          ))}
                          <span className="text-xs text-muted-foreground">
                            {timeAgo}
                          </span>
                        </div>

                        {verification.comment && (
                          <p className="text-sm leading-6 text-muted-foreground whitespace-pre-wrap">
                            {verification.comment}
                          </p>
                        )}

                        {verification.evidenceLinks &&
                          verification.evidenceLinks.length > 0 && (
                            <div className="space-y-1">
                              {verification.evidenceLinks.map((link) => (
                                <a
                                  key={link}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                  {link}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ))}
                            </div>
                          )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />0 found this helpful
                          </span>
                          {verification.source && (
                            <Badge variant="outline">
                              {verificationSourceLabels[verification.source] ??
                                verification.source}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {canExpandVerifications && (
                <div className="flex justify-center">
                  <Button
                    variant="link"
                    onClick={() => setShowAllVerifications((value) => !value)}
                  >
                    {showAllVerifications
                      ? "Show fewer verifications"
                      : `View all verifications (${formatNumber(verifications.length)})`}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {!hasVerified && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="space-y-4 pt-6">
            <div>
              <h3 className="text-lg font-semibold text-emerald-900">
                Can you verify this report?
              </h3>
              <p className="text-sm text-emerald-800">
                If you have direct knowledge or evidence, help the community by
                confirming the details below.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-emerald-800">
              <span>
                • Earn +10 reputation points for a successful verification
              </span>
              <span>• The report author receives +20 points</span>
              <span>• Verified reports gain the Community Verified badge</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setShowVerifyModal(true)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Verify This Report
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDisputeModal(true)}
              >
                <Flag className="mr-2 h-4 w-4" /> Dispute Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ReportCommentSection reportId={report.id} />

      {showVerifyModal && (
        <VerificationModal
          reportId={report.id}
          open={showVerifyModal}
          onOpenChange={setShowVerifyModal}
        />
      )}
      {showDisputeModal && (
        <DisputeModal
          reportId={report.id}
          open={showDisputeModal}
          onOpenChange={setShowDisputeModal}
        />
      )}
    </div>
  );
}

import type { ReactNode } from "react";
import {
  Award,
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Cpu,
  ExternalLink,
  FileText,
  MapPin,
  MessageSquare,
  ShieldCheck,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "@/lib/date-utils";
import { CommentSectionWrapper } from "./comment-section-wrapper";
import { ReportVoteButtons } from "./report-vote-buttons";
import { ReportVerificationActions } from "./report-verification-actions";
import { VerificationsList } from "./verifications-list";

export type ReportDetail = NonNullable<
  Awaited<ReturnType<typeof import("@/actions/reports").getReportById>>
>;
export type ReportVerificationList = Awaited<
  ReturnType<typeof import("@/actions/verifications").getReportVerifications>
>;
export type UserVote = Awaited<
  ReturnType<typeof import("@/actions/votes").getUserVote>
>;

interface ReportDetailContentProps {
  report: ReportDetail;
  verifications: ReportVerificationList;
  userVote: UserVote;
  userId: string | null;
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

export function ReportDetailContent({
  report,
  verifications,
  userVote,
  userId,
}: ReportDetailContentProps) {
  // Initialize user vote type from server-provided vote
  const initialUserVoteType = userVote
    ? userVote.voteType === "up" || userVote.voteType === "down"
      ? userVote.voteType
      : null
    : null;

  const hasVerified = userId
    ? verifications.some((verification) => verification.userId === userId)
    : false;
  const isCommunityVerified = (report.verificationCount || 0) >= 3;

  const authorHandle =
    ensureHandle(report.author?.displayUsername) ||
    ensureHandle(report.author?.username) ||
    ensureHandle(report.userId) ||
    "@unknown";

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="order-2 md:order-1 md:w-28">
          <ReportVoteButtons
            reportId={report.id}
            initialUpvotes={report.upvotes ?? 0}
            initialDownvotes={report.downvotes ?? 0}
            initialUserVoteType={initialUserVoteType}
            userId={userId}
          />
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
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-900">
                ✅ Community Verified (
                {formatNumber(report.verificationCount || 0)} verifications)
              </span>
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
              {formatNumber(report.upvotes ?? 0)} upvotes
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
              🔗 Evidence
            </h3>
            {report.evidence && report.evidence.length > 0 ? (
              <div className="space-y-2">
                {report.evidence.map((evidence) => {
                  const url = evidence.url || evidence.fileUrl;
                  if (!url) {
                    return null;
                  }
                  const isImage =
                    evidence.fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                  const isNews =
                    /techcrunch|wired|theverge|reuters|bloomberg|wsj|nytimes/i.test(
                      url,
                    );
                  const isPressRelease =
                    /press|announcement|newsroom|media/i.test(url);

                  let icon = <ExternalLink className="h-4 w-4" />;
                  let label = "Link";
                  if (isImage) {
                    icon = <FileText className="h-4 w-4" />;
                    label = "Screenshot";
                  } else if (isNews) {
                    icon = <FileText className="h-4 w-4" />;
                    label = "News Article";
                  } else if (isPressRelease) {
                    icon = <FileText className="h-4 w-4" />;
                    label = "Press Release";
                  }

                  return (
                    <div
                      key={evidence.id}
                      className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-muted-foreground">{icon}</div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-sm text-primary hover:underline truncate"
                      >
                        {url}
                      </a>
                      <Badge variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    </div>
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

      <VerificationsList verifications={verifications} />

      <ReportVerificationActions
        reportId={report.id}
        hasVerified={hasVerified}
      />

      <CommentSectionWrapper reportId={report.id} />
    </div>
  );
}

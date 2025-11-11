"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "@/lib/date-utils";
import { Award, ExternalLink, ThumbsUp } from "lucide-react";
import { useState } from "react";

export type ReportVerificationList = Awaited<
  ReturnType<typeof import("@/actions/verifications").getReportVerifications>
>;

interface VerificationsListProps {
  verifications: ReportVerificationList;
}

const tierLabels: Record<string, string> = {
  observer: "Observer",
  contributor: "Contributor",
  trusted: "Trusted",
  expert: "Expert",
};

const verificationSourceLabels: Record<string, string> = {
  work_at_company: "Worked at this company",
  direct_knowledge: "Direct knowledge",
  additional_evidence: "Found additional evidence",
  industry_insider: "Industry insider knowledge",
  other: "Other source",
};

function formatNumber(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US").format(value);
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

export function VerificationsList({ verifications }: VerificationsListProps) {
  const [showAllVerifications, setShowAllVerifications] = useState(false);

  const verificationsToRender = showAllVerifications
    ? verifications
    : verifications.slice(0, 3);
  const canExpandVerifications = verifications.length > 3;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            ✓ Verifications ({formatNumber(verifications.length)})
          </CardTitle>
          {canExpandVerifications && !showAllVerifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllVerifications(true)}
            >
              View All Verifications
            </Button>
          )}
        </div>
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
                          <ThumbsUp className="h-3 w-3" />
                          <span className="font-medium">12</span> found this
                          helpful
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
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { getReportComments } from "@/actions/comments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportCommentForm } from "./comment-form";
import { ReportCommentThread } from "./comment-thread";

interface ReportCommentSectionProps {
  reportId: string;
}

type SortOption = "hot" | "top" | "new" | "controversial";

export function ReportCommentSection({ reportId }: ReportCommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("hot");

  useEffect(() => {
    loadComments();
  }, [reportId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await getReportComments(reportId);
      setComments(data);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedComments = useMemo(() => {
    if (!comments.length) return [];

    const sorted = [...comments];

    switch (sortBy) {
      case "hot":
        // Sort by upvotes + replies, then by recency
        return sorted.sort((a, b) => {
          const aScore = (a.upvotes || 0) + (a.replies?.length || 0) * 2;
          const bScore = (b.upvotes || 0) + (b.replies?.length || 0) * 2;
          if (bScore !== aScore) return bScore - aScore;
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        });
      case "top":
        // Sort by upvotes
        return sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      case "new":
        // Sort by creation date
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );
      case "controversial":
        // Sort by ratio of upvotes to downvotes (controversial = many votes but close ratio)
        return sorted.sort((a, b) => {
          const aTotal = (a.upvotes || 0) + (a.downvotes || 0);
          const bTotal = (b.upvotes || 0) + (b.downvotes || 0);
          if (aTotal === 0 && bTotal === 0) return 0;
          if (aTotal === 0) return 1;
          if (bTotal === 0) return -1;
          const aRatio = (a.upvotes || 0) / aTotal;
          const bRatio = (b.upvotes || 0) / bTotal;
          // More controversial = closer to 0.5 ratio
          const aControversy = Math.abs(0.5 - aRatio);
          const bControversy = Math.abs(0.5 - bRatio);
          return aControversy - bControversy;
        });
      default:
        return sorted;
    }
  }, [comments, sortBy]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="controversial">Controversial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ReportCommentForm reportId={reportId} onCommentAdded={loadComments} />

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-4">
            {sortedComments.map((comment) => (
              <ReportCommentThread
                key={comment.id}
                comment={comment}
                reportId={reportId}
                onCommentAdded={loadComments}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

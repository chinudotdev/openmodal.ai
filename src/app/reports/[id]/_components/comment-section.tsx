"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { getReportComments } from "@/actions/comments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportCommentForm } from "./comment-form";
import { ReportCommentThread } from "./comment-thread";

interface ReportCommentSectionProps {
  reportId: string;
}

export function ReportCommentSection({ reportId }: ReportCommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
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
            {comments.map((comment) => (
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

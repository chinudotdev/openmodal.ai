"use client";

import { useCallback, useEffect, useState } from "react";
import { getJobComments } from "@/actions/jobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentForm } from "./comment-form";
import { CommentThread } from "./comment-thread";

interface CommentSectionProps {
  jobId: string;
}

export function CommentSection({ jobId }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getJobComments(jobId);
      setComments(data);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-2xl font-semibold">Discussion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        <CommentForm jobId={jobId} onCommentAdded={loadComments} />

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
          <p className="text-center text-sm text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                jobId={jobId}
                onCommentAdded={loadComments}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

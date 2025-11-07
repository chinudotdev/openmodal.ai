"use client";

import { useEffect, useState } from "react";
import { getComments } from "@/actions/capabilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentForm } from "./comment-form";
import { CommentThread } from "./comment-thread";

interface CommentSectionProps {
  capabilityId: string;
}

export function CommentSection({ capabilityId }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [capabilityId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await getComments(capabilityId);
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
        <CardTitle>Discussion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <CommentForm
          capabilityId={capabilityId}
          onCommentAdded={loadComments}
        />

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
                capabilityId={capabilityId}
                onCommentAdded={loadComments}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

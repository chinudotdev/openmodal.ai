"use client";

import { Copy, Share2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function ReportActions() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");

  const copyLink = () => {
    if (reportId) {
      const url = `${window.location.origin}/reports/${reportId}`;
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (!reportId) {
    return null;
  }

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <p className="text-sm font-medium">Share your contribution:</p>
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={copyLink}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex items-center gap-2"
          >
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                "I just submitted a report on OpenModal!",
              )}&url=${encodeURIComponent(
                `${process.env.NEXT_PUBLIC_APP_URL || ""}/reports/${reportId}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Share2 className="h-4 w-4" />
              Twitter
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex items-center gap-2"
          >
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                `${process.env.NEXT_PUBLIC_APP_URL || ""}/reports/${reportId}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Share2 className="h-4 w-4" />
              LinkedIn
            </a>
          </Button>
        </div>
      </div>
    </>
  );
}


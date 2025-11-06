"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  slug: string;
}

export function ShareButton({ slug }: ShareButtonProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/capabilities/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Capability",
          text: "Check out this AI capability",
          url,
        });
      } catch (error) {
        // User cancelled or error occurred
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <Button onClick={handleShare} variant="outline" className="gap-2">
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface CopyLinkButtonProps {
  reportId: string;
}

export function CopyLinkButton({ reportId }: CopyLinkButtonProps) {
  const copyLink = () => {
    const url = `${window.location.origin}/reports/${reportId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={copyLink}
      className="flex items-center gap-2"
    >
      <Copy className="h-4 w-4" />
      Copy Link
    </Button>
  );
}

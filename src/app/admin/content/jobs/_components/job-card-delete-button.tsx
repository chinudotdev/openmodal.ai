"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobCardDeleteButtonProps {
  jobId: string;
  onDelete: (jobId: string) => void;
}

export function JobCardDeleteButton({
  jobId,
  onDelete,
}: JobCardDeleteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onDelete(jobId)}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4 mr-1" />
      Delete
    </Button>
  );
}

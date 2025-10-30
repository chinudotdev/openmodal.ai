"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ConfirmExternalDialogTriggerProps {
  url: string;
  className?: string;
  children: React.ReactNode;
}

export function ConfirmExternalDialogTrigger({
  url,
  className,
  children,
}: ConfirmExternalDialogTriggerProps) {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = () => {
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={className}>
          {children}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open external link?</DialogTitle>
          <DialogDescription>
            This will open the model in a new tab.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded border border-border bg-muted px-3 py-1.5 text-sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            onClick={handleConfirm}
          >
            Continue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

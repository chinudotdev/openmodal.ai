"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: string;
}

export function OnboardingModal({
  open,
  onOpenChange,
  action = "perform this action",
}: OnboardingModalProps) {
  const router = useRouter();

  const handleCompleteOnboarding = () => {
    onOpenChange(false);
    router.push("/onboarding");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <DialogTitle>Complete Onboarding Required</DialogTitle>
              <DialogDescription className="mt-1">
                You need to complete onboarding before you can {action}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Complete your profile setup to unlock all features and start
            participating in the community. It only takes a few minutes!
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCompleteOnboarding}>
            Complete Onboarding
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

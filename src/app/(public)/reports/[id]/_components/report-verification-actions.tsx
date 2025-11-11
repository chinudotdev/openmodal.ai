"use client";

import { useState } from "react";
import { CheckCircle2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VerificationModal } from "@/components/reports/verification-modal";
import { DisputeModal } from "@/components/reports/dispute-modal";

interface ReportVerificationActionsProps {
  reportId: string;
  hasVerified: boolean;
}

export function ReportVerificationActions({
  reportId,
  hasVerified,
}: ReportVerificationActionsProps) {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  if (hasVerified) {
    return null;
  }

  return (
    <>
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="space-y-4 pt-6">
          <div>
            <h3 className="text-lg font-semibold text-emerald-900">
              Can you verify this report?
            </h3>
            <p className="text-sm text-emerald-800">
              If you have direct knowledge or evidence, help the community by
              confirming the details below.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-emerald-800">
            <span>
              • Earn +10 reputation points for a successful verification
            </span>
            <span>• The report author receives +20 points</span>
            <span>• Verified reports gain the Community Verified badge</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowVerifyModal(true)}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Verify This Report
            </Button>
            <Button variant="outline" onClick={() => setShowDisputeModal(true)}>
              <Flag className="mr-2 h-4 w-4" /> Dispute Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {showVerifyModal && (
        <VerificationModal
          reportId={reportId}
          open={showVerifyModal}
          onOpenChange={setShowVerifyModal}
        />
      )}
      {showDisputeModal && (
        <DisputeModal
          reportId={reportId}
          open={showDisputeModal}
          onOpenChange={setShowDisputeModal}
        />
      )}
    </>
  );
}

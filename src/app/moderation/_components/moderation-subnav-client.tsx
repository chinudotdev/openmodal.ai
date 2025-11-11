"use client";

import { usePathname } from "next/navigation";
import { ModerationSubnav } from "./moderation-subnav";

interface ModerationSubnavClientProps {
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    changesRequested: number;
    disputed: number;
    flagged: number;
  } | null;
}

export function ModerationSubnavClient({ stats }: ModerationSubnavClientProps) {
  const pathname = usePathname();
  
  let activeTab: "pending" | "flagged" | "disputed" = "pending";
  
  if (pathname.includes("/moderation/flagged")) {
    activeTab = "flagged";
  } else if (pathname.includes("/moderation/disputed")) {
    activeTab = "disputed";
  } else {
    activeTab = "pending";
  }

  return <ModerationSubnav stats={stats} activeTab={activeTab} />;
}


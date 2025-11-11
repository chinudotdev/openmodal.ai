import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Flag, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModerationSubnavProps {
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    changesRequested: number;
    disputed: number;
    flagged: number;
  } | null;
  activeTab: "pending" | "flagged" | "disputed";
}

export function ModerationSubnav({ stats, activeTab }: ModerationSubnavProps) {
  const tabs = [
    {
      value: "pending" as const,
      label: "Pending",
      icon: Shield,
      count: stats?.pending || 0,
      href: "/moderation/pending",
    },
    {
      value: "flagged" as const,
      label: "Flagged",
      icon: AlertTriangle,
      count: stats?.flagged || 0,
      href: "/moderation/flagged",
    },
    {
      value: "disputed" as const,
      label: "Disputed",
      icon: Flag,
      count: stats?.disputed || 0,
      href: "/moderation/disputed",
    },
  ];

  return (
    <nav className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full grid grid-cols-3">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.value;
        return (
          <Link
            key={tab.value}
            href={tab.href}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50",
            )}
          >
            <Icon className="h-4 w-4 mr-2" />
            {tab.label}
            {tab.count > 0 && (
              <Badge
                variant={tab.value === "pending" ? "secondary" : "destructive"}
                className="ml-1"
              >
                {tab.count}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}


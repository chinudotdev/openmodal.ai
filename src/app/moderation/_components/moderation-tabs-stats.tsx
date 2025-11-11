import { getModerationStats } from "@/actions/moderation";
import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Flag, Shield } from "lucide-react";

interface ModerationTabsListProps {
  activeTab: "pending" | "flagged" | "disputed";
  setActiveTab: (value: "pending" | "flagged" | "disputed") => void;
}

export async function ModerationTabsList({
  activeTab,
  setActiveTab,
}: ModerationTabsListProps) {
  const stats = await getModerationStats();

  return (
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger
        value="pending"
        className="flex items-center gap-2"
        onClick={() => setActiveTab("pending")}
      >
        <Shield className="h-4 w-4" />
        Pending
        {stats && stats.pending > 0 && (
          <Badge variant="secondary" className="ml-1">
            {stats.pending}
          </Badge>
        )}
      </TabsTrigger>
      <TabsTrigger
        value="flagged"
        className="flex items-center gap-2"
        onClick={() => setActiveTab("flagged")}
      >
        <AlertTriangle className="h-4 w-4" />
        Flagged
        {stats && stats.disputed > 0 && (
          <Badge variant="destructive" className="ml-1">
            {stats.disputed}
          </Badge>
        )}
      </TabsTrigger>
      <TabsTrigger
        value="disputed"
        className="flex items-center gap-2"
        onClick={() => setActiveTab("disputed")}
      >
        <Flag className="h-4 w-4" />
        Disputed
        {stats && stats.disputed > 0 && (
          <Badge variant="destructive" className="ml-1">
            {stats.disputed}
          </Badge>
        )}
      </TabsTrigger>
    </TabsList>
  );
}


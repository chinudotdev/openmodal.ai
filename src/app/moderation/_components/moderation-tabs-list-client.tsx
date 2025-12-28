import { AlertTriangle, Flag, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ModerationTabsListClientProps {
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    changesRequested: number;
    disputed: number;
    flagged: number;
  } | null;
}

export function ModerationTabsListClient({
  stats,
}: ModerationTabsListClientProps) {
  return (
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="pending" className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        Pending
        {stats && stats.pending > 0 && (
          <Badge variant="secondary" className="ml-1">
            {stats.pending}
          </Badge>
        )}
      </TabsTrigger>
      <TabsTrigger value="flagged" className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Flagged
        {stats && stats.flagged > 0 && (
          <Badge variant="destructive" className="ml-1">
            {stats.flagged}
          </Badge>
        )}
      </TabsTrigger>
      <TabsTrigger value="disputed" className="flex items-center gap-2">
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

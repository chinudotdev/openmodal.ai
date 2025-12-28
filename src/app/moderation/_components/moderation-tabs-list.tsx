import { AlertTriangle, Flag, Shield } from "lucide-react";
import { getModerationStats } from "@/actions/moderation";
import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModerationTabsListClient } from "./moderation-tabs-list-client";

export async function ModerationTabsList() {
  const stats = await getModerationStats();

  return <ModerationTabsListClient stats={stats} />;
}

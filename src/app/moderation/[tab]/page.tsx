import { redirect } from "next/navigation";
import { ModerationQueue } from "../_components/moderation-queue";

interface ModerationTabPageProps {
  params: Promise<{
    tab: string;
  }>;
}

export default async function ModerationTabPage({
  params,
}: ModerationTabPageProps) {
  const { tab } = await params;

  // Validate tab parameter
  if (!["pending", "flagged", "disputed"].includes(tab)) {
    redirect("/moderation/pending");
  }

  const activeTab = tab as "pending" | "flagged" | "disputed";

  return <ModerationQueue activeTab={activeTab} />;
}

export async function generateStaticParams() {
  return [{ tab: "pending" }, { tab: "flagged" }, { tab: "disputed" }];
}

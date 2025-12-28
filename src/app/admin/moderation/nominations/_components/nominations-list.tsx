"use client";

import { useQuery } from "@tanstack/react-query";
import { getModeratorNominations } from "@/actions/admin-moderation";
import { NominationCard } from "./nomination-card";

export function NominationsList() {
  const { data: nominations, isLoading } = useQuery({
    queryKey: ["moderator-nominations"],
    queryFn: () => getModeratorNominations("pending"),
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading nominations...</div>;
  }

  if (!nominations || nominations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No pending nominations
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {nominations.map((nomination) => (
        <NominationCard key={nomination.id} nomination={nomination} />
      ))}
    </div>
  );
}

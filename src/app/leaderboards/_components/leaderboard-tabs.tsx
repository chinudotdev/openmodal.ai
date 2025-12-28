"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LeaderboardType =
  | "monthly_contributors"
  | "monthly_verifiers"
  | "rising_stars"
  | "all_time";

interface LeaderboardTabsProps {
  currentType: LeaderboardType;
}

export function LeaderboardTabs({ currentType }: LeaderboardTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", type);
    router.push(`/leaderboards?${params.toString()}`);
  };

  return (
    <Tabs value={currentType} onValueChange={handleTypeChange}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="monthly_contributors">
          Monthly Top Contributors
        </TabsTrigger>
        <TabsTrigger value="monthly_verifiers">Monthly Verifiers</TabsTrigger>
        <TabsTrigger value="rising_stars">Rising Stars</TabsTrigger>
        <TabsTrigger value="all_time">All-Time Hall of Fame</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

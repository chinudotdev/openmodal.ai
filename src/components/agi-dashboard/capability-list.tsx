"use client";

import { CapabilityCard } from "./capability-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { getCapabilities } from "@/actions/capabilities";

type Capability = Awaited<ReturnType<typeof getCapabilities>>[0];

interface CapabilityListProps {
  capabilities: Capability[];
  totalCount?: number;
}

export function CapabilityList({
  capabilities,
  totalCount,
}: CapabilityListProps) {
  // Show first 5 capabilities
  const displayedCapabilities = capabilities.slice(0, 5);

  if (displayedCapabilities.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No capabilities available yet. Check back soon!
        </p>
      </div>
    );
  }

  // Transform database capability to mock data format for compatibility
  const transformedCapabilities = displayedCapabilities.map((cap) => ({
    id: cap.slug,
    name: cap.name,
    icon: cap.category?.icon || "Brain",
    progress: cap.progressPercentage,
    status: cap.status,
    strongAreas: (cap.whatWorks || []).slice(0, 3).map((area) => ({
      name: area,
      progress: cap.progressPercentage + Math.floor(Math.random() * 20),
    })),
    keyGaps: (cap.whatStruggles || []).slice(0, 2).map((gap) => ({
      name: gap,
      progress: Math.max(
        0,
        cap.progressPercentage - Math.floor(Math.random() * 30),
      ),
    })),
    jobsProtected: cap.jobsProtectedCount || 0,
    description: cap.description,
  }));

  return (
    <div className="space-y-4">
      {transformedCapabilities.map((capability, index) => (
        <CapabilityCard
          key={capability.id}
          capability={capability}
          index={index}
        />
      ))}

      {/* View All Button */}
      <div className="pt-2">
        <Link href="/capabilities">
          <Button variant="outline" className="w-full group">
            View all {totalCount ?? capabilities.length} capabilities
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { getCapabilities } from "@/actions/capabilities";
import { Button } from "@/components/ui/button";
import { CapabilityCard } from "./capability-card";

type Capability = Awaited<ReturnType<typeof getCapabilities>>[0];

interface CapabilityListProps {
  capabilities: Capability[];
}

// Deterministic hash function to replace Math.random()
// Generates a consistent value between 0 and max based on the input string
function deterministicHash(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % max;
}

export function CapabilityList({ capabilities }: CapabilityListProps) {
  if (capabilities.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No capabilities available yet. Check back soon!
        </p>
      </div>
    );
  }

  const transformedCapabilities = capabilities.map((cap) => ({
    id: cap.slug,
    name: cap.name,
    icon: cap.category?.icon || "Brain",
    progress: cap.progressPercentage,
    status: cap.status,
    strongAreas: (cap.whatWorks || []).slice(0, 3).map((area) => ({
      name: area,
      progress: cap.progressPercentage + deterministicHash(area, 20),
    })),
    keyGaps: (cap.whatStruggles || []).slice(0, 2).map((gap) => ({
      name: gap,
      progress: Math.max(
        0,
        cap.progressPercentage - deterministicHash(gap, 30),
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
            View all capabilities
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

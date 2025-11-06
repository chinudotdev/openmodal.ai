"use client";

import { mockCapabilities } from "@/lib/mock-data";
import { CapabilityCard } from "./capability-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CapabilityList() {
  // Show first 5 capabilities
  const displayedCapabilities = mockCapabilities.slice(0, 5);

  return (
    <div className="space-y-4">
      {displayedCapabilities.map((capability, index) => (
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
            View all {mockCapabilities.length} capabilities
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

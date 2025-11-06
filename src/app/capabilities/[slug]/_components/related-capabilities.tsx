"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCapabilities } from "@/actions/capabilities";

interface RelatedCapabilitiesProps {
  categoryId: string;
  currentSlug: string;
}

export function RelatedCapabilities({
  categoryId,
  currentSlug,
}: RelatedCapabilitiesProps) {
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    loadRelated();
  }, [categoryId, currentSlug]);

  const loadRelated = async () => {
    try {
      const capabilities = await getCapabilities(
        { categoryId },
        "progress_desc",
        5,
        0,
      );
      // Filter out current capability
      const filtered = capabilities.filter((cap) => cap.slug !== currentSlug);
      setRelated(filtered.slice(0, 3));
    } catch (error) {
      console.error("Failed to load related capabilities:", error);
    }
  };

  if (related.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Capabilities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2">
          {related.map((cap) => (
            <li key={cap.id}>
              <Link href={`/capabilities/${cap.slug}`}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-auto py-2"
                >
                  <span className="text-sm text-muted-foreground">
                    {cap.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {cap.progressPercentage}%
                  </span>
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

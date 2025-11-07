"use client";

import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CompareJobsButton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <Button variant="outline" className="w-full gap-2" asChild>
          <Link href="/jobs/compare">
            <BarChart3 className="h-4 w-4" />
            Compare Jobs
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

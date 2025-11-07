"use client";

import { ArrowRight, Building2 } from "lucide-react";
import type { getCapabilityBySlug } from "@/actions/capabilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface TopOrganizationsProps {
  organizations: NonNullable<Capability>["organizations"];
}

export function TopOrganizations({ organizations }: TopOrganizationsProps) {
  if (organizations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Organizations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-3">
          {organizations.slice(0, 5).map((org) => (
            <li key={org.id} className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{org.name}</p>
                {org.focusArea && (
                  <p className="text-sm text-muted-foreground">
                    Working on: {org.focusArea}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        {organizations.length > 5 && (
          <Button variant="outline" className="w-full gap-2">
            View all {organizations.length} organizations
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

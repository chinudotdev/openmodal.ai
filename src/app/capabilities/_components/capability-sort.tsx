"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";

interface CapabilitySortProps {
  currentSort: string;
}

const sortOptions = [
  { value: "progress_desc", label: "Progress (high to low)" },
  { value: "progress_asc", label: "Progress (low to high)" },
  { value: "jobs_desc", label: "Impact (jobs protected)" },
  { value: "activity_desc", label: "Recent Activity" },
  { value: "name_asc", label: "Name (A-Z)" },
];

export function CapabilitySort({ currentSort }: CapabilitySortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page"); // Reset to page 1
    router.push(`/capabilities?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sort By</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={currentSort} onValueChange={handleSortChange}>
          {sortOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label
                htmlFor={option.value}
                className="font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

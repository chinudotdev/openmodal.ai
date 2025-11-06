"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";

interface JobSortProps {
  currentSort: string;
}

const sortOptions = [
  { value: "risk_desc", label: "Risk % (high to low)" },
  { value: "risk_asc", label: "Risk % (low to high)" },
  { value: "workers_desc", label: "Workers (most to least)" },
  { value: "salary_desc", label: "Salary (high to low)" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "updated_desc", label: "Recently Updated" },
];

export function JobSort({ currentSort }: JobSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page"); // Reset to page 1
    router.push(`/jobs?${params.toString()}`);
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


"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JobFiltersProps {
  industries: Array<{ id: string; name: string; slug: string; icon?: string | null }>;
  currentFilters: {
    industry?: string;
    status?: string;
    riskMin?: number;
    riskMax?: number;
    salaryMin?: number;
    salaryMax?: number;
    search?: string;
  };
}

export function JobFilters({ industries, currentFilters }: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentFilters.search || "");
  const [riskMin, setRiskMin] = useState<string>(
    currentFilters.riskMin?.toString() || "0",
  );
  const [riskMax, setRiskMax] = useState<string>(
    currentFilters.riskMax?.toString() || "100",
  );
  const [salaryMin, setSalaryMin] = useState<string>(
    currentFilters.salaryMin?.toString() || "0",
  );
  const [salaryMax, setSalaryMax] = useState<string>(
    currentFilters.salaryMax?.toString() || "200000",
  );

  const updateFilter = (key: string, value: string | number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value));
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1
    router.push(`/jobs?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", search || null);
  };

  const handleRiskMinChange = (value: string) => {
    setRiskMin(value);
    const num = parseInt(value, 10);
    if (!Number.isNaN(num)) {
      updateFilter("riskMin", num);
    } else {
      updateFilter("riskMin", null);
    }
  };

  const handleRiskMaxChange = (value: string) => {
    setRiskMax(value);
    const num = parseInt(value, 10);
    if (!Number.isNaN(num)) {
      updateFilter("riskMax", num);
    } else {
      updateFilter("riskMax", null);
    }
  };

  const handleSalaryMinChange = (value: string) => {
    setSalaryMin(value);
    const num = parseInt(value, 10);
    if (!Number.isNaN(num)) {
      updateFilter("salaryMin", num);
    } else {
      updateFilter("salaryMin", null);
    }
  };

  const handleSalaryMaxChange = (value: string) => {
    setSalaryMax(value);
    const num = parseInt(value, 10);
    if (!Number.isNaN(num)) {
      updateFilter("salaryMax", num);
    } else {
      updateFilter("salaryMax", null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="pl-9"
          />
        </div>
      </form>

      {/* Industry Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Industry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="industry-all"
              checked={!currentFilters.industry}
              onCheckedChange={() => updateFilter("industry", null)}
            />
            <Label
              htmlFor="industry-all"
              className="font-normal cursor-pointer"
            >
              All
            </Label>
          </div>
          {industries.map((ind) => (
            <div key={ind.id} className="flex items-center space-x-2">
              <Checkbox
                id={`industry-${ind.id}`}
                checked={currentFilters.industry === ind.id}
                onCheckedChange={(checked) =>
                  updateFilter("industry", checked ? ind.id : null)
                }
              />
              <Label
                htmlFor={`industry-${ind.id}`}
                className="font-normal cursor-pointer"
              >
                {ind.icon && <span className="mr-1">{ind.icon}</span>}
                {ind.name}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Status Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { value: "safe", label: "Safe (0-25%)" },
            { value: "partial", label: "Partial (26-75%)" },
            { value: "high_risk", label: "High Risk (76-99%)" },
            { value: "automated", label: "Automated (100%)" },
          ].map((status) => (
            <div key={status.value} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status.value}`}
                checked={currentFilters.status === status.value}
                onCheckedChange={(checked) =>
                  updateFilter("status", checked ? status.value : null)
                }
              />
              <Label
                htmlFor={`status-${status.value}`}
                className="font-normal cursor-pointer"
              >
                {status.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risk % Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Automation Risk %</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="riskMin" className="text-xs">
                Min
              </Label>
              <Input
                id="riskMin"
                type="number"
                min={0}
                max={100}
                value={riskMin}
                onChange={(e) => handleRiskMinChange(e.target.value)}
                placeholder="0"
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="riskMax" className="text-xs">
                Max
              </Label>
              <Input
                id="riskMax"
                type="number"
                min={0}
                max={100}
                value={riskMax}
                onChange={(e) => handleRiskMaxChange(e.target.value)}
                placeholder="100"
                className="h-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Salary (USD)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="salaryMin" className="text-xs">
                Min
              </Label>
              <Input
                id="salaryMin"
                type="number"
                min={0}
                value={salaryMin}
                onChange={(e) => handleSalaryMinChange(e.target.value)}
                placeholder="0"
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="salaryMax" className="text-xs">
                Max
              </Label>
              <Input
                id="salaryMax"
                type="number"
                min={0}
                value={salaryMax}
                onChange={(e) => handleSalaryMaxChange(e.target.value)}
                placeholder="200000"
                className="h-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

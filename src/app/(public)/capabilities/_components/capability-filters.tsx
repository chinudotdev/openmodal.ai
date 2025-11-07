"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CapabilityFiltersProps {
  categories: any[];
  currentFilters: {
    categoryId?: string;
    status?: string;
    timeline?: string;
    search?: string;
  };
}

export function CapabilityFilters({
  categories,
  currentFilters,
}: CapabilityFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentFilters.search || "");

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1
    router.push(`/capabilities?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", search || null);
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
            placeholder="Search capabilities..."
            className="pl-9"
          />
        </div>
      </form>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="category-all"
              checked={!currentFilters.categoryId}
              onCheckedChange={() => updateFilter("category", null)}
            />
            <Label
              htmlFor="category-all"
              className="font-normal cursor-pointer"
            >
              All ({categories.reduce((sum, cat) => sum + (cat.count || 0), 0)})
            </Label>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={currentFilters.categoryId === category.id}
                onCheckedChange={(checked) =>
                  updateFilter("category", checked ? category.id : null)
                }
              />
              <Label
                htmlFor={`category-${category.id}`}
                className="font-normal cursor-pointer"
              >
                {category.name} ({category.count || 0})
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
          {["solved", "partial", "unsolved"].map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status}`}
                checked={currentFilters.status === status}
                onCheckedChange={(checked) =>
                  updateFilter("status", checked ? status : null)
                }
              />
              <Label
                htmlFor={`status-${status}`}
                className="font-normal cursor-pointer capitalize"
              >
                {status}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Timeline Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { value: "near", label: "Near (0-5 years)" },
            { value: "medium", label: "Medium (5-15 years)" },
            { value: "far", label: "Far (15+ years)" },
          ].map((timeline) => (
            <div key={timeline.value} className="flex items-center space-x-2">
              <Checkbox
                id={`timeline-${timeline.value}`}
                checked={currentFilters.timeline === timeline.value}
                onCheckedChange={(checked) =>
                  updateFilter("timeline", checked ? timeline.value : null)
                }
              />
              <Label
                htmlFor={`timeline-${timeline.value}`}
                className="font-normal cursor-pointer"
              >
                {timeline.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

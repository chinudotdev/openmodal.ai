"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobAutocomplete } from "./job-autocomplete";

interface JobHeroProps {
  initialSearch?: string;
}

export function JobHero({ initialSearch = "" }: JobHeroProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(search.trim())}`);
    } else {
      router.push("/jobs");
    }
    setShowAutocomplete(false);
  };

  const handleJobSelect = (slug: string) => {
    router.push(`/jobs/${slug}`);
    setShowAutocomplete(false);
  };

  return (
    <div className="relative space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold text-foreground">
          Check Your Job's Automation Risk
        </h1>
        <p className="text-muted-foreground">
          Discover how AI automation affects your career
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowAutocomplete(e.target.value.length > 0);
            }}
            onFocus={() => setShowAutocomplete(search.length > 0)}
            placeholder='Search: "Physical Therapist"'
            className="pl-10 pr-24 h-12 text-lg"
          />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            Search
          </Button>
        </div>

        {showAutocomplete && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1">
            <JobAutocomplete
              query={search}
              onSelect={handleJobSelect}
              onClose={() => setShowAutocomplete(false)}
            />
          </div>
        )}
      </form>

      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
        <span>Popular:</span>
        {["Software Developer", "Accountant", "Plumber", "Data Analyst"].map(
          (job) => (
            <button
              key={job}
              onClick={() => {
                setSearch(job);
                const form = document.querySelector("form");
                if (form) {
                  form.requestSubmit();
                }
              }}
              type="button"
              className="hover:text-foreground transition-colors"
            >
              {job}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

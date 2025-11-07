"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { searchJobsByTitle } from "@/actions/onboarding";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface JobOption {
  id: string;
  title: string;
  industry: string;
}

interface JobAutocompleteInputProps {
  value?: string;
  jobId?: string;
  onChange: (jobTitle: string, jobId?: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  placeholder?: string;
}

export function JobAutocompleteInput({
  value = "",
  jobId,
  onChange,
  label = "Job Title",
  required = false,
  error,
  className,
  placeholder = "e.g., Software Engineer",
}: JobAutocompleteInputProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [searchResults, setSearchResults] = useState<JobOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [, setSelectedJobId] = useState<string | undefined>(jobId);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced job search
  const searchJobs = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchJobsByTitle(query, 10);
      if (result.success) {
        setSearchResults(result.jobs);
      }
    } catch (error) {
      console.error("Error searching jobs:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchJobs(searchQuery);
        setShowDropdown(true);
      }, 300);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchJobs]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (job: JobOption) => {
    setSearchQuery(job.title);
    setSelectedJobId(job.id);
    onChange(job.title, job.id);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setSelectedJobId(undefined);
    onChange(newValue, undefined);
  };

  return (
    <Field className={cn("relative", className)}>
      <FieldLabel>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FieldLabel>
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => {
              if (searchQuery.length >= 2) {
                setShowDropdown(true);
              }
            }}
            placeholder={placeholder}
            className={cn("pl-9", error && "border-destructive")}
          />
        </div>
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
            <div className="max-h-60 overflow-auto p-1">
              {searchResults.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => handleSelect(job)}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <div className="font-medium">{job.title}</div>
                  {job.industry && (
                    <div className="text-xs text-muted-foreground">
                      {job.industry}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}

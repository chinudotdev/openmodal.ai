"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  baseUrl: string; // e.g., "/models" or "/providers"
  className?: string;
  searchQuery?: string;
}

export default function SearchInput({
  placeholder = "Search...",
  baseUrl,
  className = "",
  searchQuery = "",
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL parameters - use "search" parameter to match existing implementation
  const search = searchParams.get("search") || searchQuery;
  const [query, setQuery] = useState(search);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (value.trim()) {
        params.set("search", value);
      } else {
        params.delete("search");
      }

      // Reset to page 1 when searching
      params.delete("page");

      router.push(`${baseUrl}?${params.toString()}`);
    }, 300);
  };

  // Update local state when searchQuery prop changes
  useEffect(() => {
    setQuery(search);
  }, [search]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
      <Input
        className="w-full pl-10 bg-accent"
        onChange={handleInputChange}
        placeholder={placeholder}
        value={query}
      />
    </div>
  );
}

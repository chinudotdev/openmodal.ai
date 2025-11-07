"use client";

import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SearchResult } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    capabilities: SearchResult[];
    jobs: SearchResult[];
    technologies: SearchResult[];
    total: number;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
        );
        const data = await response.json();
        setResults(data);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!results || results.total === 0) return;

      const allResults = [
        ...results.capabilities,
        ...results.jobs,
        ...results.technologies,
      ];
      const maxIndex = allResults.length - 1;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        const selectedResult = allResults[selectedIndex];
        if (selectedResult) {
          window.location.href = selectedResult.url;
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    },
    [results, selectedIndex],
  );

  const renderResultCategory = (
    title: string,
    items: SearchResult[],
    startIndex: number,
  ) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-3 last:mb-0">
        <div className="px-3 py-2 text-xs font-semibold text-[var(--gray-500)] uppercase tracking-wider">
          {title} ({items.length})
        </div>
        {items.slice(0, 3).map((item, index) => {
          const globalIndex = startIndex + index;
          const isSelected = globalIndex === selectedIndex;
          return (
            <Link
              key={item.id}
              href={item.url}
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
              className={cn(
                "flex flex-col gap-0.5 px-3 py-2 rounded-md transition-colors cursor-pointer",
                isSelected
                  ? "bg-[var(--primary-50)]"
                  : "hover:bg-[var(--gray-100)]",
              )}
            >
              <span className="text-sm font-medium text-[var(--gray-900)]">
                {item.title}
              </span>
              {item.description && (
                <span className="text-xs text-[var(--gray-500)] line-clamp-1">
                  {item.description}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative hidden lg:block w-full max-w-[400px]"
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gray-400)]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search capabilities, jobs, technologies..."
          className={cn(
            "w-full h-10 pl-10 pr-10 rounded-lg border text-sm transition-all",
            "bg-[var(--gray-100)] border-[var(--gray-200)] text-[var(--gray-900)]",
            "placeholder:text-[var(--gray-400)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-opacity-30",
            "focus:border-[var(--primary-500)] focus:bg-white",
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gray-400)] animate-spin" />
        )}
      </div>

      {isOpen && results && results.total > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg border border-[var(--gray-200)] shadow-lg py-2 z-50 max-h-[400px] overflow-y-auto">
          {renderResultCategory("Capabilities", results.capabilities, 0)}
          {renderResultCategory(
            "Jobs",
            results.jobs,
            results.capabilities.length,
          )}
          {renderResultCategory(
            "Technologies",
            results.technologies,
            results.capabilities.length + results.jobs.length,
          )}
          <div className="border-t border-[var(--gray-200)] mt-2 pt-2 px-3">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="text-sm text-[var(--primary-500)] hover:text-[var(--primary-600)] font-medium"
              onClick={() => setIsOpen(false)}
            >
              View all results →
            </Link>
          </div>
        </div>
      )}

      {isOpen && results && results.total === 0 && !isLoading && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg border border-[var(--gray-200)] shadow-lg py-4 px-3 z-50">
          <p className="text-sm text-[var(--gray-500)] text-center">
            No results found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
}

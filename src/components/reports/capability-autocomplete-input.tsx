"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CapabilityOption {
  id: string;
  title: string;
  description?: string;
}

interface CapabilityAutocompleteInputProps {
  value?: string;
  capabilityId?: string;
  onChange: (capabilityName: string, capabilityId?: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  placeholder?: string;
}

export function CapabilityAutocompleteInput({
  value = "",
  capabilityId,
  onChange,
  label = "Capability Name",
  required = false,
  error,
  className,
  placeholder = "e.g., Natural Language Understanding",
}: CapabilityAutocompleteInputProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [searchResults, setSearchResults] = useState<CapabilityOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [, setSelectedCapabilityId] = useState<string | undefined>(
    capabilityId,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced capability search
  const searchCapabilities = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();
      if (data.capabilities) {
        setSearchResults(
          data.capabilities.map(
            (cap: { id: string; title: string; description?: string }) => ({
              id: cap.id,
              title: cap.title,
              description: cap.description,
            }),
          ),
        );
      }
    } catch (error) {
      console.error("Error searching capabilities:", error);
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
        searchCapabilities(searchQuery);
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
  }, [searchQuery, searchCapabilities]);

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

  const handleSelect = (capability: CapabilityOption) => {
    setSearchQuery(capability.title);
    setSelectedCapabilityId(capability.id);
    onChange(capability.title, capability.id);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setSelectedCapabilityId(undefined);
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
              {searchResults.map((capability) => (
                <button
                  key={capability.id}
                  type="button"
                  onClick={() => handleSelect(capability)}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <div className="font-medium">{capability.title}</div>
                  {capability.description && (
                    <div className="text-xs text-muted-foreground">
                      {capability.description}
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

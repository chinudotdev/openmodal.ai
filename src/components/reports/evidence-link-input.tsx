"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EvidenceLinkInputProps {
  value: string[];
  onChange: (links: string[]) => void;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  placeholder?: string;
}

export function EvidenceLinkInput({
  value = [],
  onChange,
  label = "Evidence Links",
  required = false,
  error,
  className,
  placeholder = "https://example.com/article",
}: EvidenceLinkInputProps) {
  const [newLink, setNewLink] = useState("");

  const addLink = () => {
    if (newLink.trim()) {
      // Basic URL validation
      try {
        new URL(newLink.trim());
        onChange([...value, newLink.trim()]);
        setNewLink("");
      } catch {
        // Invalid URL - could show error here
      }
    }
  };

  const removeLink = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addLink();
    }
  };

  return (
    <Field className={cn("space-y-2", className)}>
      <FieldLabel>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FieldLabel>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="url"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addLink}
            disabled={!newLink.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {value.length > 0 && (
          <div className="space-y-2">
            {value.map((link, index) => (
              <div
                key={`evidence-${index}-${link.slice(0, 20)}`}
                className="flex items-center gap-2 p-2 bg-secondary rounded-md"
              >
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-primary hover:underline truncate"
                >
                  {link}
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeLink(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        {error && <FieldError>{error}</FieldError>}
        {value.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Add at least one evidence link (required)
          </p>
        )}
      </div>
    </Field>
  );
}

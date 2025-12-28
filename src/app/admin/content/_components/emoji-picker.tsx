"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
  label?: string;
}

const commonEmojis = [
  "💻",
  "🏥",
  "🏭",
  "💼",
  "🎓",
  "🏦",
  "🚗",
  "🍔",
  "🏠",
  "🎨",
  "📊",
  "🔬",
  "⚙️",
  "🧠",
  "👁️",
  "🤝",
  "🎯",
  "📱",
  "🌐",
  "🔧",
];

export function EmojiPicker({
  value,
  onChange,
  label = "Icon",
}: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
          >
            {value ? (
              <span className="text-2xl">{value}</span>
            ) : (
              <span className="text-muted-foreground">Select emoji</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <Input
              placeholder="Search emoji..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="grid grid-cols-8 gap-2">
              {commonEmojis
                .filter((emoji) =>
                  search
                    ? emoji.toLowerCase().includes(search.toLowerCase())
                    : true,
                )
                .map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onChange(emoji);
                      setOpen(false);
                    }}
                    className="text-2xl hover:bg-muted rounded p-2 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Or type an emoji directly in the input field
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or type emoji here..."
        maxLength={2}
      />
    </div>
  );
}

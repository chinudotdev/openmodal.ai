"use client";

import {
  BookOpen,
  Building2,
  ChevronDown,
  FileText,
  Info,
  Mail,
  Map as MapIcon,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MoreDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="gap-1 text-[var(--gray-500)] hover:text-[var(--gray-900)]"
        >
          More
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem asChild>
          <Link
            href="/leaderboards"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Trophy className="h-4 w-4" />
            <span>Leaderboards</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/map" className="flex items-center gap-2 cursor-pointer">
            <MapIcon className="h-4 w-4" />
            <span>Map View</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/organizations"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Building2 className="h-4 w-4" />
            <span>Organizations</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/research"
            className="flex items-center gap-2 cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>Research Papers</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/api-docs"
            className="flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            <span>API Docs</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/about"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Info className="h-4 w-4" />
            <span>About</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/methodology"
            className="flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            <span>Methodology</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/contact"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Mail className="h-4 w-4" />
            <span>Contact</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

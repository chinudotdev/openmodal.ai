"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MoreDropdown } from "./more-dropdown";

const navLinks = [
  { href: "/", label: "AGI" },
  { href: "/jobs", label: "Jobs" },
  { href: "/technologies", label: "Technologies" },
  { href: "/reports", label: "Reports" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative px-4 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            {link.label}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
      <MoreDropdown />
    </nav>
  );
}

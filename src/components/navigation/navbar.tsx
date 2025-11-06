"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";
import { MobileMenu } from "./mobile-menu";
import { MoreDropdown } from "./more-dropdown";
import { useSession } from "@/contexts/session-context";

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoading } = useSession();

  const navLinks = [
    { href: "/", label: "AGI Status" },
    { href: "/jobs", label: "Jobs" },
    { href: "/technologies", label: "Technologies" },
    { href: "/reports", label: "Reports" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center gap-4">
          <MobileMenu />
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">OpenModal</span>
          </Link>
        </div>

        {/* Center: Desktop navigation + Search */}
        <div className="hidden lg:flex items-center gap-6 flex-1 justify-center max-w-3xl mx-8">
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
          <SearchBar />
        </div>

        {/* Right: Notifications + User menu */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full ring-2 ring-background" />
          </Button>
          <UserMenu user={user} isLoading={isLoading} />
        </div>
      </div>
    </header>
  );
}

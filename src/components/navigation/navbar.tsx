import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { Suspense } from "react";
import { Spinner } from "../ui/spinner";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Suspense fallback={<Spinner className="h-8 w-8" />}>
            <MobileMenu />
          </Suspense>
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
          <Suspense fallback={<Spinner className="h-8 w-8" />}>
            <NavLinks />
          </Suspense>
          <Suspense fallback={<Spinner className="h-8 w-8" />}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Right: Notifications + User menu */}
        <div className="flex items-center gap-2">
          <Suspense fallback={<Spinner className="h-8 w-8" />}>
            <NotificationDropdown />
          </Suspense>
          <Suspense fallback={<Spinner className="h-8 w-8" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

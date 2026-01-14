"use client";

import {
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  Cpu,
  FileText,
  Info,
  Mail,
  Map as MapIcon,
  MapPin,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const mainLinks = [
    { href: "/capabilities", label: "Capabilities", icon: Brain },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/technologies", label: "Technologies", icon: Cpu },
    { href: "/reports", label: "Reports", icon: MapPin },
  ];

  const secondaryLinks = [
    { href: "/map", label: "Map View", icon: MapIcon },
    { href: "/organizations", label: "Organizations", icon: Building2 },
    { href: "/research", label: "Research", icon: FileText },
    { href: "/api-docs", label: "API", icon: BookOpen },
  ];

  const footerLinks = [
    { href: "/about", label: "About", icon: Info },
    { href: "/methodology", label: "Methodology", icon: BookOpen },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex flex-col h-full py-6">
          <div className="px-6 mb-6">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">
                OpenModal
              </span>
            </Link>
          </div>

          <nav className="flex flex-col gap-1 px-3">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary border-l-4 border-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="my-4 border-t border-border" />

          <nav className="flex flex-col gap-1 px-3">
            {secondaryLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary border-l-4 border-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="my-4 border-t border-border" />

          <nav className="flex flex-col gap-1 px-3">
            {footerLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary border-l-4 border-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

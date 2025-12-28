"use client";

import {
  BarChart3,
  FileText,
  Settings,
  Shield,
  Users,
  LayoutDashboard,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number | null;
};

const navigation: NavigationItem[] = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  {
    name: "Moderation",
    href: "/admin/moderation",
    icon: Shield,
    badge: null, // Will be populated with counts
  },
  { name: "Reports", href: "/admin/reports", icon: FileText },
  { name: "Content", href: "/admin/content", icon: BookOpen },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {item.badge !== null &&
                  item.badge !== undefined &&
                  item.badge > 0 && (
                    <span className="ml-auto rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
                      {item.badge}
                    </span>
                  )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            ← Back to Main Site
          </Link>
        </div>
      </div>
    </div>
  );
}

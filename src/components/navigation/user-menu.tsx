"use client";

import {
  Bell,
  FileText,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Settings,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import type { SessionUser } from "@/contexts/session-context";

interface UserMenuProps {
  user?: SessionUser | null;
  isLoading?: boolean;
}

export function UserMenu({ user, isLoading }: UserMenuProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full" disabled>
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem asChild>
            <Link
              href="/login"
              className="flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/signup"
              className="flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Sign Up</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8 border-2 border-[var(--gray-200)] hover:border-[var(--primary-500)] transition-colors">
            <AvatarImage src={user?.image ?? ""} alt={user.name} />
            <AvatarFallback className="bg-[var(--primary-100)] text-[var(--primary-600)]">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium text-[var(--gray-900)]">
            @{user.name.toLowerCase().replace(/\s+/g, "_")}
          </p>
          <p className="text-xs text-[var(--gray-500)]">234 points • Trusted</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 cursor-pointer"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/my-reports"
            className="flex items-center gap-2 cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>My Reports</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/notifications"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

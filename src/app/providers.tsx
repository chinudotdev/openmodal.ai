"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/components/ph-provider";
import { QueryProvider } from "@/components/query-provider";

// Dynamically import SessionProvider to avoid SSR issues
const SessionProvider = dynamic(
  () =>
    import("@/contexts/session-context").then((mod) => ({
      default: mod.SessionProvider,
    })),
  { ssr: false },
);

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <PostHogProvider>
        <QueryProvider>
          <SessionProvider>{children}</SessionProvider>
        </QueryProvider>
      </PostHogProvider>
    </ThemeProvider>
  );
}

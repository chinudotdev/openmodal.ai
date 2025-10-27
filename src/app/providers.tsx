import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/components/ph-provider";
import { QueryProvider } from "@/components/query-provider";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <PostHogProvider>
        <QueryProvider>{children}</QueryProvider>
      </PostHogProvider>
    </ThemeProvider>
  );
}

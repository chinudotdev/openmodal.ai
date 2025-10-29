import { ModeToggle } from "@/components/toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          {/* Left side - URL display */}
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex h-8 w-72 items-center px-3 py-1 text-lg font-medium hover:opacity-80 transition-opacity"
            >
              <span className="text-foreground">openmodal.ai</span>
            </Link>
          </div>

          {/* Right side - Model, Provider, Author, and Theme controls */}
          <div className="flex items-center space-x-2">
            <Link href="/models">
              <Button variant="outline" size="sm">
                ai models
              </Button>
            </Link>
            <Link href="/providers">
              <Button variant="outline" size="sm">
                ai providers
              </Button>
            </Link>
            <Link href="/contribute">
              <Button variant="outline" size="sm">
               contribute
              </Button>
            </Link>

            {/* Theme Toggle */}
            <ModeToggle />
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}

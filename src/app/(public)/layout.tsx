import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/toggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className=" flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex h-8 w-72 items-center px-3 py-1 text-lg font-medium hover:opacity-80 transition-opacity"
            >
              <span className="text-foreground">openmodal.ai</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 px-2">
            <Link href="/contribute">
              <Button variant="outline" size="sm">
                contribute
              </Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

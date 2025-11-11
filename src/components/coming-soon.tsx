import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export function ComingSoon({
  title,
  description,
  icon: Icon,
}: ComingSoonProps) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          {Icon && (
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          )}
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mb-8 text-muted-foreground">
            {description ||
              "This page is coming soon. We're working hard to bring you something amazing."}
          </p>
          <Button asChild variant="default">
            <Link href="/">Go to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

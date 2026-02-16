import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "@/lib/date-utils";

interface CapabilityCardProps {
  capability: any;
}

export function CapabilityCard({ capability }: CapabilityCardProps) {
  return (
    <Link href={`/capabilities/${capability.slug}`}>
      <Card className="h-full border-muted shadow-none bg-transparent hover:bg-muted  hover:border-primary/20 transition-all duration-300 rounded-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{capability.name}</CardTitle>
            <StatusBadge status={capability.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Category: {capability.category || "Unknown"} • Updated{" "}
            {formatDistanceToNow(capability.updatedAt, { addSuffix: true })}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {capability.description}
          </p>

          {/* Progress */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Progress
              </span>
              <span className="text-sm font-bold text-primary">
                {capability.progressPercentage}%
              </span>
            </div>
            <ProgressBar progress={capability.progressPercentage} size="md" />
          </div>

          {/* What Works - show first 2 items */}
          {capability.whatWorks && capability.whatWorks.length > 0 && (
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">What works:</p>
              <ul className="list-disc list-inside text-foreground">
                {capability.whatWorks
                  .slice(0, 2)
                  .map((item: string, idx: number) => (
                    <li key={idx} className="truncate">
                      {item}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button variant="ghost" className="w-full group">
            View details
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

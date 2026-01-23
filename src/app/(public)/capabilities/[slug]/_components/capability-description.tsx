import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { getCapabilityBySlug } from "@/actions/capabilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Capability = Awaited<ReturnType<typeof getCapabilityBySlug>>;

interface CapabilityDescriptionProps {
  capability: NonNullable<Capability>;
}

export function CapabilityDescription({
  capability,
}: CapabilityDescriptionProps) {
  const hasWhatWorks = capability.whatWorks && capability.whatWorks.length > 0;
  const hasWhatStruggles =
    capability.whatStruggles && capability.whatStruggles.length > 0;
  const hasWhatDoesntWork =
    capability.whatDoesntWork && capability.whatDoesntWork.length > 0;

  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-2xl font-semibold">What Is This?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        <p className="text-muted-foreground">{capability.description}</p>

        {/* What Works */}
        {hasWhatWorks && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              What Works
            </h4>
            <ul className="space-y-1 pl-6">
              {capability.whatWorks.map((item) => (
                <li
                  key={item}
                  className="text-sm text-muted-foreground list-disc"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What Struggles */}
        {hasWhatStruggles && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              What Struggles
            </h4>
            <ul className="space-y-1 pl-6">
              {capability.whatStruggles.map((item) => (
                <li
                  key={item}
                  className="text-sm text-muted-foreground list-disc"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What Doesn't Work */}
        {hasWhatDoesntWork && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2 text-red-700 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              What Doesn&apos;t Work
            </h4>
            <ul className="space-y-1 pl-6">
              {capability.whatDoesntWork.map((item) => (
                <li
                  key={item}
                  className="text-sm text-muted-foreground list-disc"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

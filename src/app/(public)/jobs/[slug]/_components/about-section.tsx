import type { getJobBySlug } from "@/actions/jobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface AboutSectionProps {
  job: NonNullable<Job>;
}

export function AboutSection({ job }: AboutSectionProps) {
  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none py-0">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-2xl font-semibold">About This Job</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-0">
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground whitespace-pre-line">
            {job.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

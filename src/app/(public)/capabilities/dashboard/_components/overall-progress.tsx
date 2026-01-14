import { ProgressBar } from "@/components/shared/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OverallProgressProps {
  progress: number;
}

export function OverallProgress({ progress }: OverallProgressProps) {
  return (
    <Card className="shadow-none border-0 bg-transparent rounded-none">
      <CardHeader>
        <CardTitle className="text-2xl">Overall AGI Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Progress
            </span>
            <span className="text-3xl font-bold text-primary">{progress}%</span>
          </div>
          <ProgressBar progress={progress} size="lg" animated gradient />
        </div>
        <p className="text-sm text-muted-foreground">
          Average progress across all AI capabilities toward Artificial General
          Intelligence
        </p>
      </CardContent>
    </Card>
  );
}

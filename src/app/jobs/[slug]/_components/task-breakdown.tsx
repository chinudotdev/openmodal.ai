"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "./task-card";
import type { getJobBySlug } from "@/actions/jobs";

type Job = Awaited<ReturnType<typeof getJobBySlug>>;

interface TaskBreakdownProps {
  job: NonNullable<Job>;
}

export function TaskBreakdown({ job }: TaskBreakdownProps) {
  const tasks = job.tasks || [];

  const safeTasks = tasks.filter((t) => t.automationStatus === "safe");
  const partialTasks = tasks.filter((t) => t.automationStatus === "partial");
  const replaceableTasks = tasks.filter(
    (t) => t.automationStatus === "replaceable"
  );

  const safePercentage = tasks.reduce(
    (sum, t) => sum + (t.automationStatus === "safe" ? t.percentageOfJob : 0),
    0
  );
  const partialPercentage = tasks.reduce(
    (sum, t) =>
      sum + (t.automationStatus === "partial" ? t.percentageOfJob : 0),
    0
  );
  const replaceablePercentage = tasks.reduce(
    (sum, t) =>
      sum + (t.automationStatus === "replaceable" ? t.percentageOfJob : 0),
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">
          This job consists of {tasks.length} major tasks:
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}

        {/* Task Summary */}
        <div className="border-t pt-4 space-y-2">
          <h3 className="font-semibold text-foreground">Task Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-green-600 font-semibold">
                Safe: {safeTasks.length} tasks ({safePercentage.toFixed(0)}%)
              </span>
            </div>
            <div>
              <span className="text-yellow-600 font-semibold">
                Partial: {partialTasks.length} tasks ({partialPercentage.toFixed(0)}%)
              </span>
            </div>
            <div>
              <span className="text-red-600 font-semibold">
                Replaceable: {replaceableTasks.length} tasks ({replaceablePercentage.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


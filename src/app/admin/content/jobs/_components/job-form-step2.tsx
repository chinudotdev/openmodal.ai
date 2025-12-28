"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateJobTasks } from "@/actions/admin-content";
import { FormField } from "../../_components/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { TaskInput } from "@/actions/admin-content";

interface TaskFormData extends TaskInput {
  id?: string;
  expanded?: boolean;
}

type JobData = Awaited<ReturnType<typeof import("@/actions/admin-content").getAdminJobById>>;
type Capabilities = Awaited<ReturnType<typeof import("@/actions/admin-content").getAllCapabilitiesForSelect>>;

interface JobFormStep2Props {
  jobId: string;
  initialJobData: JobData | null;
  initialCapabilities: Capabilities;
}

export function JobFormStep2({ jobId, initialJobData, initialCapabilities }: JobFormStep2Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState<TaskFormData[]>([]);

  useEffect(() => {
    if (initialJobData?.tasks) {
      setTasks(
        initialJobData.tasks.map((t) => ({
          description: t.description,
          category: t.category || "",
          automationStatus: t.automationStatus,
          difficultyToAutomate: t.difficultyToAutomate,
          percentageOfJob: t.percentageOfJob,
          timeSpentHoursPerWeek: t.timeSpentHoursPerWeek
            ? Number(t.timeSpentHoursPerWeek)
            : undefined,
          reasoningNotes: t.reasoningNotes || "",
          evidenceLinks: t.evidenceLinks || [],
          existingAiSolutions: t.existingAiSolutions || [],
          capabilityIds: [],
          expanded: false,
        })),
      );
    } else if (tasks.length === 0) {
      // Add initial empty task
      setTasks([
        {
          description: "",
          automationStatus: "safe",
          difficultyToAutomate: "moderate",
          percentageOfJob: 0,
          expanded: true,
        },
      ]);
    }
  }, [initialJobData]);

  const totalPercentage = tasks.reduce((sum, t) => sum + (t.percentageOfJob || 0), 0);
  const isValid = Math.abs(totalPercentage - 100) < 0.01 && tasks.length > 0;

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        description: "",
        automationStatus: "safe",
        difficultyToAutomate: "moderate",
        percentageOfJob: 0,
        expanded: true,
      },
    ]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, updates: Partial<TaskFormData>) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], ...updates };
    setTasks(newTasks);
  };

  const toggleTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], expanded: !newTasks[index].expanded };
    setTasks(newTasks);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error(`Tasks must sum to 100%. Current sum: ${totalPercentage.toFixed(1)}%`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateJobTasks(
        jobId,
        tasks.map((t) => ({
          description: t.description,
          category: t.category,
          automationStatus: t.automationStatus,
          difficultyToAutomate: t.difficultyToAutomate,
          percentageOfJob: t.percentageOfJob,
          timeSpentHoursPerWeek: t.timeSpentHoursPerWeek,
          reasoningNotes: t.reasoningNotes,
          evidenceLinks: t.evidenceLinks,
          existingAiSolutions: t.existingAiSolutions,
          capabilityIds: t.capabilityIds,
        })),
      );

      if (result.success) {
        toast.success("Tasks saved successfully");
        router.push(`/admin/content/jobs/${jobId}/review`);
      } else {
        toast.error(result.error || "Failed to save tasks");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save tasks");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialJobData) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const jobData = initialJobData;
  const capabilities = initialCapabilities;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/content/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Job</h1>
          <p className="text-muted-foreground mt-1">
            Step 2 of 3: Task Breakdown
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Job: {jobData.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Define what this job entails on a day-to-day basis
          </p>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Current total: {totalPercentage.toFixed(1)}% of job defined (need 100%)
              </span>
              {!isValid && (
                <span className="text-sm text-destructive">
                  ⚠️ Tasks must sum to 100%
                </span>
              )}
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isValid ? "bg-green-500" : "bg-yellow-500"
                }`}
                style={{ width: `${Math.min(100, totalPercentage)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tasks.length} task(s) added
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button type="button" onClick={addTask} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>

          {tasks.map((task, index) => (
            <Card key={index} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Task #{index + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTask(index)}
                    >
                      {task.expanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTask(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {task.expanded && (
                <CardContent className="space-y-4">
                  <FormField label="Task Description" required>
                    <Textarea
                      value={task.description}
                      onChange={(e) =>
                        updateTask(index, { description: e.target.value })
                      }
                      placeholder="e.g., Writing boilerplate code"
                      rows={2}
                    />
                  </FormField>

                  <FormField label="Task Category">
                    <Input
                      value={task.category || ""}
                      onChange={(e) =>
                        updateTask(index, { category: e.target.value })
                      }
                      placeholder="e.g., Coding, Testing, Design"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Automation Status" required>
                      <Select
                        value={task.automationStatus}
                        onValueChange={(value: "safe" | "partial" | "replaceable") =>
                          updateTask(index, { automationStatus: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="safe">Safe - Not automatable</SelectItem>
                          <SelectItem value="partial">Partial - Partially automatable</SelectItem>
                          <SelectItem value="replaceable">Replaceable - Fully automatable</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Difficulty to Automate" required>
                      <Select
                        value={task.difficultyToAutomate}
                        onValueChange={(
                          value: "trivial" | "easy" | "moderate" | "hard" | "very_hard",
                        ) => updateTask(index, { difficultyToAutomate: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trivial">Trivial</SelectItem>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                          <SelectItem value="very_hard">Very Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Percentage of Job" required>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={task.percentageOfJob || 0}
                        onChange={(e) =>
                          updateTask(index, {
                            percentageOfJob: parseInt(e.target.value, 10) || 0,
                          })
                        }
                      />
                      <div className="mt-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={task.percentageOfJob || 0}
                          onChange={(e) =>
                            updateTask(index, {
                              percentageOfJob: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full"
                        />
                      </div>
                    </FormField>

                    <FormField label="Time Spent (hours/week)">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={task.timeSpentHoursPerWeek || ""}
                        onChange={(e) =>
                          updateTask(index, {
                            timeSpentHoursPerWeek: parseFloat(e.target.value) || undefined,
                          })
                        }
                        placeholder="e.g., 4.8"
                      />
                    </FormField>
                  </div>

                  <FormField label="Why this assessment? (Reasoning)">
                    <Textarea
                      value={task.reasoningNotes || ""}
                      onChange={(e) =>
                        updateTask(index, { reasoningNotes: e.target.value })
                      }
                      placeholder="Explain why this task can or cannot be automated..."
                      rows={3}
                    />
                  </FormField>

                  <FormField label="Required Capabilities">
                    <Select
                      value=""
                      onValueChange={(value) => {
                        const currentIds = task.capabilityIds || [];
                        if (!currentIds.includes(value)) {
                          updateTask(index, {
                            capabilityIds: [...currentIds, value],
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select capabilities..." />
                      </SelectTrigger>
                      <SelectContent>
                        {capabilities.map((cap) => (
                          <SelectItem key={cap.id} value={cap.id}>
                            {cap.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {task.capabilityIds && task.capabilityIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {task.capabilityIds.map((capId) => {
                          const cap = capabilities?.find((c) => c.id === capId);
                          return cap ? (
                            <span
                              key={capId}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm"
                            >
                              {cap.name}
                              <button
                                type="button"
                                onClick={() => {
                                  updateTask(index, {
                                    capabilityIds: task.capabilityIds?.filter(
                                      (id) => id !== capId,
                                    ),
                                  });
                                }}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </FormField>
                </CardContent>
              )}
            </Card>
          ))}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/content/jobs/${jobId}/edit`}>← Back</Link>
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSubmit}
                disabled={isSubmitting || !isValid}
              >
                Save Draft
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !isValid}>
                {isSubmitting ? "Saving..." : "Next: Review & Publish →"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


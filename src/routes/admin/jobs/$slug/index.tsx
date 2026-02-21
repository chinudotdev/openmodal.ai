import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useState } from 'react'
import {
  Link,
  createFileRoute,
  notFound,
  useRouter,
} from '@tanstack/react-router'

import {
  createTaskCapabilitySubtypeFn,
  createTaskFn,
  deleteJobFn,
  deleteTaskCapabilitySubtypeFn,
  deleteTaskFn,
  getAllCapabilitySubtypesForAdminFn,
  getJobBySlugForAdminFn,
} from '@/actions/admin/jobs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

const taskFormSchema = z.object({
  name: z.string().min(1, 'Task name is required').max(200),
  reason: z.string().max(500),
})

const capabilityFormSchema = z.object({
  capabilitySubtypeId: z.string().min(1, 'Capability is required').max(100),
  importance: z.enum(['critical', 'important', 'minor']),
  minimumLevelRequired: z.number().min(0).max(100),
  notes: z.string().max(500),
})

export const Route = createFileRoute('/admin/jobs/$slug/')({
  component: AdminJobDetailPage,
  loader: async ({ params }) => {
    const result = await getJobBySlugForAdminFn({
      data: { slug: params.slug },
    })
    if (!result.success) {
      throw notFound()
    }
    return { job: result.data }
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center py-12">
      <Spinner />
    </div>
  ),
})

function AdminJobDetailPage() {
  const { job } = Route.useLoaderData()
  const router = useRouter()

  const { tasks, ...jobData } = job

  const [capabilityDialogOpen, setCapabilityDialogOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [capabilitySubtypes, setCapabilitySubtypes] = useState<Array<any>>([])
  const [capabilitySearch, setCapabilitySearch] = useState('')
  const [isLoadingSubtypes, setIsLoadingSubtypes] = useState(false)

  // Fetch capability subtypes when dialog opens
  const openCapabilityDialog = async (taskId: string) => {
    setSelectedTaskId(taskId)
    setCapabilityDialogOpen(true)
    setCapabilitySearch('')
    setIsLoadingSubtypes(true)

    const result = await getAllCapabilitySubtypesForAdminFn()
    if (result.success) {
      setCapabilitySubtypes(result.data)
    }
    setIsLoadingSubtypes(false)
  }

  const capabilityForm = useForm({
    defaultValues: {
      capabilitySubtypeId: '',
      importance: 'important' as 'critical' | 'important' | 'minor',
      minimumLevelRequired: 50,
      notes: '',
    },
    validators: {
      onSubmit: capabilityFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!selectedTaskId) return

      const result = await createTaskCapabilitySubtypeFn({
        data: {
          taskId: selectedTaskId,
          capabilitySubtypeId: value.capabilitySubtypeId,
          importance: value.importance,
          minimumLevelRequired: value.minimumLevelRequired,
          notes: value.notes || undefined,
        },
      })

      if (result.success) {
        await router.invalidate()
        setCapabilityDialogOpen(false)
        capabilityForm.reset()
      } else {
        console.error('Failed to add capability:', result.error)
      }
    },
  })

  const handleDeleteCapability = async (linkId: string) => {
    const result = await deleteTaskCapabilitySubtypeFn({
      data: { id: linkId },
    })
    if (result.success) {
      await router.invalidate()
    } else {
      console.error('Failed to delete capability:', result.error)
    }
  }

  const handleDelete = async () => {
    const result = await deleteJobFn({
      data: { id: job.id },
    })
    if (result.success) {
      await router.invalidate()
      await router.navigate({ to: '/admin/jobs' })
    } else {
      console.error('Failed to delete job:', result.error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    const result = await deleteTaskFn({
      data: { id: taskId },
    })
    if (result.success) {
      await router.invalidate()
    } else {
      console.error('Failed to delete task:', result.error)
    }
  }

  const taskForm = useForm({
    defaultValues: {
      name: '',
      reason: '',
    },
    validators: {
      onSubmit: taskFormSchema,
    },
    onSubmit: async ({ value }) => {
      // Infer percentageOfJob: evenly distribute among all tasks
      const newTaskCount = tasks.length + 1
      const inferredPercentage = Math.round(100 / newTaskCount)

      const result = await createTaskFn({
        data: {
          jobId: job.id,
          name: value.name,
          percentageOfJob: inferredPercentage,
          automatable: 'partial',
          reason: value.reason || undefined,
        },
      })
      if (result.success) {
        await router.invalidate()
        taskForm.reset()
      } else {
        console.error('Failed to create task:', result.error)
      }
    },
  })

  const getAutomatableColor = (automatable: string) => {
    switch (automatable) {
      case 'yes':
        return 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
      case 'partial':
        return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
      case 'no':
        return 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      default:
        return ''
    }
  }

  const getAutomatableIcon = (automatable: string) => {
    switch (automatable) {
      case 'yes':
        return '⚠️'
      case 'partial':
        return '⚠️'
      case 'no':
        return '✅'
      default:
        return ''
    }
  }

  const getAutomatableLabel = (automatable: string) => {
    switch (automatable) {
      case 'yes':
        return 'Automatable'
      case 'partial':
        return 'Partially Automatable'
      case 'no':
        return 'Safe'
      default:
        return ''
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20'
      case 'low':
        return 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20'
      default:
        return ''
    }
  }

  const categoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 dark:text-red-400'
      case 'important':
        return 'bg-orange-500/10 text-orange-500 dark:text-orange-400'
      case 'minor':
        return 'bg-blue-500/10 text-blue-500 dark:text-blue-400'
      default:
        return ''
    }
  }

  const importanceOptions = [
    { value: 'critical', label: 'Critical' },
    { value: 'important', label: 'Important' },
    { value: 'minor', label: 'Minor' },
  ]

  // Filter capability subtypes based on search
  const filteredSubtypes = capabilitySubtypes.filter(
    (subtype: any) =>
      !capabilitySearch ||
      subtype.name?.toLowerCase().includes(capabilitySearch.toLowerCase()) ||
      subtype.capability?.name
        ?.toLowerCase()
        .includes(capabilitySearch.toLowerCase()),
  )

  // Group subtypes by capability for better UX
  const groupedSubtypes = filteredSubtypes.reduce(
    (acc: Record<string, Array<any>>, subtype: any) => {
      const capabilityName = subtype.capability?.name || 'Other'
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!acc[capabilityName]) {
        acc[capabilityName] = []
      }
      acc[capabilityName].push(subtype)
      return acc
    },
    {},
  )

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/jobs">
            <Button variant="ghost" size="sm">
              ← Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold flex items-center gap-3">
              <span>{jobData.icon || '💼'}</span>
              {jobData.name}
            </h1>
            <p className="text-muted-foreground mt-1">{jobData.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/jobs/$slug/edit" params={{ slug: jobData.slug }}>
            <Button variant="outline">Edit Job</Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Job</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Job</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{jobData.name}"? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Job Details */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Left Column - Description (60%) */}
            <div className="md:col-span-3">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Description
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                {jobData.description}
              </p>
            </div>

            {/* Right Column - Metadata (40%) */}
            <div className="md:col-span-2 space-y-6">
              {/* Category */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Category</p>
                <p className="font-medium">{categoryLabel(jobData.category)}</p>
              </div>

              {/* Risk Level */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
                <Badge
                  variant="outline"
                  className={getRiskColor(jobData.riskLevel)}
                >
                  {jobData.riskLevel.charAt(0).toUpperCase() +
                    jobData.riskLevel.slice(1)}
                </Badge>
              </div>

              {/* Confidence */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                <p className="font-medium">
                  {jobData.confidence.charAt(0).toUpperCase() +
                    jobData.confidence.slice(1)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Tasks ({tasks.length})</h2>
        </div>

        {/* Add Task Form */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Add New Task</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void taskForm.handleSubmit()
              }}
              className="space-y-4"
            >
              <taskForm.Field name="name">
                {(field) => (
                  <Field>
                    <FieldLabel>Task Name</FieldLabel>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g., Writing code"
                      disabled={taskForm.state.isSubmitting}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </taskForm.Field>

              <taskForm.Field name="reason">
                {(field) => (
                  <Field>
                    <FieldLabel>Reason (optional)</FieldLabel>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Additional context about this task..."
                      disabled={taskForm.state.isSubmitting}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </taskForm.Field>

              <p className="text-sm text-muted-foreground">
                Automation status and percentage will be calculated based on
                capability requirements.
              </p>

              <div className="flex justify-end">
                <taskForm.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit || isSubmitting}>
                      {isSubmitting ? 'Adding...' : 'Add Task'}
                    </Button>
                  )}
                </taskForm.Subscribe>
              </div>
            </form>
          </CardContent>
        </Card>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No tasks defined for this job yet. Add one above to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task: any) => (
              <Card key={task.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{task.name}</h3>
                        <Badge
                          variant="outline"
                          className={getAutomatableColor(task.automatable)}
                        >
                          {getAutomatableIcon(task.automatable)}{' '}
                          {getAutomatableLabel(task.automatable)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {task.percentageOfJob}% of job
                        </span>
                      </div>
                      {task.reason && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.reason}
                        </p>
                      )}

                      {/* Capability Requirements */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">
                            Required Capabilities (
                            {task.capabilityRequirements?.length || 0})
                          </h4>
                          <Dialog
                            open={
                              capabilityDialogOpen && selectedTaskId === task.id
                            }
                            onOpenChange={(open) => {
                              setCapabilityDialogOpen(open)
                              if (!open) {
                                setSelectedTaskId(null)
                                capabilityForm.reset()
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCapabilityDialog(task.id)}
                              >
                                + Add Capability
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Add Required Capability
                                </DialogTitle>
                                <DialogDescription>
                                  Select the AI capabilities required to perform
                                  this task
                                </DialogDescription>
                              </DialogHeader>

                              <form
                                onSubmit={(e) => {
                                  e.preventDefault()
                                  void capabilityForm.handleSubmit()
                                }}
                                className="space-y-4"
                              >
                                {/* Search */}
                                <div>
                                  <FieldLabel>Search Capabilities</FieldLabel>
                                  <Input
                                    value={capabilitySearch}
                                    onChange={(e) =>
                                      setCapabilitySearch(e.target.value)
                                    }
                                    placeholder="Search by name..."
                                    disabled={isLoadingSubtypes}
                                  />
                                </div>

                                {/* Capability Subtype Select */}
                                <capabilityForm.Field name="capabilitySubtypeId">
                                  {(field) => (
                                    <Field>
                                      <FieldLabel>Capability</FieldLabel>
                                      <Select
                                        value={field.state.value}
                                        onValueChange={(value) =>
                                          field.handleChange(value)
                                        }
                                        disabled={
                                          isLoadingSubtypes ||
                                          capabilityForm.state.isSubmitting
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select a capability" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {isLoadingSubtypes ? (
                                            <div className="flex items-center justify-center py-2">
                                              <Spinner className="h-4 w-4" />
                                            </div>
                                          ) : filteredSubtypes.length === 0 ? (
                                            <div className="py-2 text-center text-sm text-muted-foreground">
                                              No capabilities found. Try a
                                              different search.
                                            </div>
                                          ) : (
                                            Object.entries(groupedSubtypes).map(
                                              ([
                                                capabilityName,
                                                subtypesList,
                                              ]) => (
                                                <div
                                                  key={capabilityName}
                                                  className="p-1"
                                                >
                                                  <div className="text-xs font-medium text-muted-foreground px-2">
                                                    {capabilityName}
                                                  </div>
                                                  {subtypesList.map(
                                                    (subtype: any) => (
                                                      <SelectItem
                                                        key={subtype.id}
                                                        value={subtype.id}
                                                      >
                                                        <div className="flex items-center gap-2">
                                                          <span className="flex-1">
                                                            {subtype.name}
                                                          </span>
                                                          <span className="text-xs text-muted-foreground">
                                                            {
                                                              subtype.progressPercentage
                                                            }
                                                            %
                                                          </span>
                                                        </div>
                                                      </SelectItem>
                                                    ),
                                                  )}
                                                </div>
                                              ),
                                            )
                                          )}
                                        </SelectContent>
                                      </Select>
                                      <FieldError
                                        errors={field.state.meta.errors}
                                      />
                                    </Field>
                                  )}
                                </capabilityForm.Field>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <capabilityForm.Field name="importance">
                                    {(field) => (
                                      <Field>
                                        <FieldLabel>Importance</FieldLabel>
                                        <Select
                                          value={field.state.value}
                                          onValueChange={(value) =>
                                            field.handleChange(
                                              value as typeof field.state.value,
                                            )
                                          }
                                          disabled={
                                            capabilityForm.state.isSubmitting
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select importance" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {importanceOptions.map((option) => (
                                              <SelectItem
                                                key={option.value}
                                                value={option.value}
                                              >
                                                {option.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <FieldError
                                          errors={field.state.meta.errors}
                                        />
                                      </Field>
                                    )}
                                  </capabilityForm.Field>

                                  <capabilityForm.Field name="minimumLevelRequired">
                                    {(field) => (
                                      <Field>
                                        <FieldLabel>Min Level (%)</FieldLabel>
                                        <Input
                                          type="number"
                                          min={0}
                                          max={100}
                                          value={field.state.value}
                                          onChange={(e) =>
                                            field.handleChange(
                                              Number.parseInt(e.target.value) ||
                                                0,
                                            )
                                          }
                                          disabled={
                                            capabilityForm.state.isSubmitting
                                          }
                                        />
                                        <FieldError
                                          errors={field.state.meta.errors}
                                        />
                                      </Field>
                                    )}
                                  </capabilityForm.Field>
                                </div>

                                <capabilityForm.Field name="notes">
                                  {(field) => (
                                    <Field>
                                      <FieldLabel>Notes (optional)</FieldLabel>
                                      <Input
                                        value={field.state.value}
                                        onChange={(e) =>
                                          field.handleChange(e.target.value)
                                        }
                                        placeholder="Any additional notes..."
                                        disabled={
                                          capabilityForm.state.isSubmitting
                                        }
                                      />
                                      <FieldError
                                        errors={field.state.meta.errors}
                                      />
                                    </Field>
                                  )}
                                </capabilityForm.Field>

                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      disabled={
                                        capabilityForm.state.isSubmitting
                                      }
                                    >
                                      Cancel
                                    </Button>
                                  </DialogClose>
                                  <Button
                                    type="submit"
                                    disabled={
                                      !capabilityForm.state.canSubmit ||
                                      capabilityForm.state.isSubmitting
                                    }
                                  >
                                    {capabilityForm.state.isSubmitting
                                      ? 'Adding...'
                                      : 'Add Capability'}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      {/* Show Existing Capabilities */}
                      {task.capabilityRequirements &&
                        task.capabilityRequirements.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {task.capabilityRequirements.map((req: any) => (
                              <Badge
                                key={req.id}
                                variant="secondary"
                                className="text-xs border"
                                title={`${req.importance}: ${req.minimumLevelRequired}%`}
                              >
                                <span className="mr-1">
                                  {req.capability?.name ||
                                    req.capabilitySubtype?.name}
                                </span>
                                <span
                                  className={getImportanceColor(req.importance)}
                                >
                                  {req.minimumLevelRequired}%
                                </span>
                                <button
                                  onClick={() => handleDeleteCapability(req.id)}
                                  className="ml-0 hover:text-destructive"
                                  title="Remove"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{task.name}"?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

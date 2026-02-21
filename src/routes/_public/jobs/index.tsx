import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'

import { Search } from 'lucide-react'
import { useCallback } from 'react'

import { getJobsPaginatedFn } from '@/actions/jobs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Search params schema for the jobs page
const jobsSearchSchema = {
  page: 1,
  limit: 12,
  category: 'all',
  riskLevel: 'all',
  search: '',
  sortBy: 'name',
}

export const Route = createFileRoute('/_public/jobs/')({
  component: JobsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page) || jobsSearchSchema.page,
      limit: Number(search.limit) || jobsSearchSchema.limit,
      category: (search.category as string) || jobsSearchSchema.category,
      riskLevel: (search.riskLevel as string) || jobsSearchSchema.riskLevel,
      search: (search.search as string) || jobsSearchSchema.search,
      sortBy: (search.sortBy as string) || jobsSearchSchema.sortBy,
    }
  },
  loaderDeps: ({ search }) => ({
    page: search.page,
    limit: search.limit,
    category: search.category,
    riskLevel: search.riskLevel,
    search: search.search,
    sortBy: search.sortBy,
  }),
  loader: async ({ deps }) => {
    const result = await getJobsPaginatedFn({
      data: {
        page: deps.page,
        limit: deps.limit,
        category:
          deps.category && deps.category !== 'all'
            ? (deps.category as
                | 'other'
                | 'technology'
                | 'healthcare'
                | 'trades'
                | 'service'
                | 'creative'
                | 'finance'
                | 'education'
                | 'legal'
                | 'manufacturing')
            : undefined,
        riskLevel:
          deps.riskLevel && deps.riskLevel !== 'all'
            ? (deps.riskLevel as 'low' | 'medium' | 'high' | 'critical')
            : undefined,
        search: deps.search || undefined,
        sortBy: deps.sortBy as 'name' | 'risk' | 'recent',
      },
    })
    return result
  },
  pendingComponent: () => (
    <div className="min-h-svh flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading jobs...</p>
      </div>
    </div>
  ),
})

function JobsPage() {
  const { jobs, total, page, totalPages } = Route.useLoaderData()
  const navigate = useNavigate()
  const search = Route.useSearch()

  const updateSearchParam = useCallback(
    (key: string, value: string | number) => {
      navigate({
        to: '/jobs',
        search: (prev: any) => ({
          ...prev,
          [key]: value,
          page: key !== 'page' ? 1 : value, // Reset to page 1 when changing filters
        }),
      })
    },
    [navigate],
  )

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-500'
    if (risk >= 40) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getRiskLabel = (risk: number) => {
    if (risk >= 70) return 'High Risk'
    if (risk >= 40) return 'Medium Risk'
    return 'Low Risk'
  }

  const categoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'technology', label: 'Technology' },
    { value: 'trades', label: 'Trades' },
    { value: 'service', label: 'Service' },
    { value: 'creative', label: 'Creative' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'legal', label: 'Legal' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'other', label: 'Other' },
  ]

  const riskLevels = [
    { value: 'all', label: 'All Risk Levels' },
    { value: 'low', label: 'Low Risk (0-25%)' },
    { value: 'medium', label: 'Medium Risk (26-50%)' },
    { value: 'high', label: 'High Risk (51-75%)' },
    { value: 'critical', label: 'Critical Risk (76-100%)' },
  ]

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'risk', label: 'Highest Risk' },
    { value: 'recent', label: 'Recently Added' },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-3xl">
            <h1 className="text-2xl md:text-4xl font-semibold tracking-tight mb-2">
              Jobs at Risk of Automation
            </h1>
            <p className="text-muted-foreground">
              Understand which jobs are most affected by AI capabilities and
              automation. Track how the job market is evolving.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="border-b border-border/40 bg-muted/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search jobs..."
                value={search.search}
                onChange={(e) => updateSearchParam('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select
                value={search.category}
                onValueChange={(value) => updateSearchParam('category', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={search.riskLevel}
                onValueChange={(value) => updateSearchParam('riskLevel', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  {riskLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={search.sortBy}
                onValueChange={(value) => updateSearchParam('sortBy', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((sort) => (
                    <SelectItem key={sort.value} value={sort.value}>
                      {sort.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters */}
          {(search.category !== 'all' ||
            search.riskLevel !== 'all' ||
            search.search) && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {search.category !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Category: {categoryLabel(search.category)}
                  <button
                    onClick={() => updateSearchParam('category', 'all')}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {search.riskLevel !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Risk: {search.riskLevel}
                  <button
                    onClick={() => updateSearchParam('riskLevel', 'all')}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {search.search && (
                <Badge variant="secondary" className="gap-1">
                  "{search.search}"
                  <button
                    onClick={() => updateSearchParam('search', '')}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigate({
                    to: '/jobs',
                    search: () => ({
                      page: 1,
                      limit: 12,
                      category: 'all',
                      riskLevel: 'all',
                      search: '',
                      sortBy: 'name',
                    }),
                  })
                }
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Results count */}
      <section className="container mx-auto px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Showing {jobs.length} of {total} jobs
        </p>
      </section>

      {/* Jobs List */}
      <section className="container mx-auto px-6 pb-12">
        {jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job: any) => (
                <Link
                  key={job.id}
                  to="/jobs/$slug"
                  params={{ slug: job.slug }}
                  className="group"
                >
                  <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{job.icon || '💼'}</span>
                          <div>
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {job.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {categoryLabel(job.category)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={getRiskColor(job.automationRiskPercentage)}
                        >
                          {getRiskLabel(job.automationRiskPercentage)}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              Automation Risk
                            </span>
                            <span
                              className={`text-xs font-medium ${getRiskColor(job.automationRiskPercentage)}`}
                            >
                              {job.automationRiskPercentage}%
                            </span>
                          </div>
                          <Progress
                            value={job.automationRiskPercentage}
                            className="h-2"
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                          <span>View analysis →</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => updateSearchParam('page', page - 1)}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        className="w-10"
                        onClick={() => updateSearchParam('page', pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => updateSearchParam('page', page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found.</p>
            {(search.category !== 'all' ||
              search.riskLevel !== 'all' ||
              search.search) && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  navigate({
                    to: '/jobs',
                    search: () => ({
                      page: 1,
                      limit: 12,
                      category: 'all',
                      riskLevel: 'all',
                      search: '',
                      sortBy: 'name',
                    }),
                  })
                }
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Track Your Job's Future
            </h2>
            <p className="text-muted-foreground mb-6">
              Stay informed about how AI is affecting your profession. Get
              personalized insights and recommendations.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/login">
                <Button>📝 Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline">💼 Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

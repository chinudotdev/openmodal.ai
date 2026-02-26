import { Link } from '@tanstack/react-router'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { formatNumber, formatRelativeTime } from '@/lib/format'

// ============================================
// TYPES
// ============================================

export interface ReportCardProps {
  report: {
    id: string
    jobTitle: string
    description: string
    impactType: string
    title: string | null
    location: string | null
    country: string | null
    companyName: string | null
    companySize: string | null
    technologyDescription: string | null
    workersAffectedCount: number | null
    eventDate: Date | null
    sourceUrl: string | null
    technologyId: string | null
    submittedBy: string
    isAnonymous: boolean
    reporterRelationship: string | null
    status: string
    upvotes: number
    viewCount: number
    isFeatured: boolean
    createdAt: Date
    updatedAt: Date
    submitter?: {
      id: string
      name: string | null
      username: string
      email: string | null
    } | null
    technology?: {
      id: string
      name: string
      slug: string
      type: string
    } | null
    _enrichmentCount?: number
    _flagCount?: number
  }
}

// ============================================
// HELPERS
// ============================================

const IMPACT_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  layoffs: { label: 'Layoffs', color: 'destructive', icon: '🔴' },
  reduced_hours: { label: 'Reduced Hours', color: 'secondary', icon: '🟠' },
  role_change: { label: 'Role Change', color: 'default', icon: '🟡' },
  new_tools: { label: 'New Tools', color: 'outline', icon: '🟢' },
  productivity_boost: {
    label: 'Productivity Boost',
    color: 'outline',
    icon: '🚀',
  },
  no_change: { label: 'No Change', color: 'outline', icon: '➡️' },
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  employee: 'Employee',
  former_employee: 'Former Employee',
  manager: 'Manager',
  witness: 'Witness',
  news: 'News Report',
  researcher: 'Researcher',
}

// ============================================
// COMPONENTS
// ============================================

export function ReportCard({ report }: ReportCardProps) {
  // Get impact type config with fallback
  const impactConfig =
    IMPACT_TYPE_CONFIG[report.impactType] ?? IMPACT_TYPE_CONFIG.no_change

  // Truncate description for card view
  const truncatedDescription =
    report.description.length > 200
      ? report.description.slice(0, 200) + '...'
      : report.description

  return (
    <Link to="/reports/$id" params={{ id: report.id }}>
      <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={impactConfig.color as any}>
                  <span className="mr-1">{impactConfig.icon}</span>
                  {impactConfig.label}
                </Badge>
                {report.isFeatured && (
                  <Badge
                    variant="outline"
                    className="text-amber-600 border-amber-600"
                  >
                    ⭐ Featured
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {report.title || report.jobTitle}
              </h3>
            </div>
          </div>

          <CardDescription className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{report.jobTitle}</span>
              {report.companyName && (
                <>
                  <span>•</span>
                  <span>{report.companyName}</span>
                </>
              )}
            </div>
            {(report.location || report.country) && (
              <div className="text-sm">
                {[report.location, report.country].filter(Boolean).join(', ')}
              </div>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {truncatedDescription}
          </p>

          {report.technology && (
            <div className="mt-3">
              <Badge variant="outline" className="text-xs">
                Tech: {report.technology.name}
              </Badge>
            </div>
          )}

          {report.workersAffectedCount && (
            <div className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium">
                {formatNumber(report.workersAffectedCount)}
              </span>{' '}
              workers affected
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-4">
            <span>
              {report.isAnonymous
                ? 'Anonymous'
                : report.submitter?.username || 'Unknown'}
            </span>
            {report.reporterRelationship && (
              <>
                <span>•</span>
                <span>{RELATIONSHIP_LABELS[report.reporterRelationship]}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span>{formatRelativeTime(report.createdAt)}</span>
            <div className="flex items-center gap-1">
              <span>👍</span>
              <span>{formatNumber(report.upvotes)}</span>
            </div>
            {report._enrichmentCount && report._enrichmentCount > 0 && (
              <div className="flex items-center gap-1">
                <span>🔗</span>
                <span>{report._enrichmentCount}</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

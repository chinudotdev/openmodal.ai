import { Link } from '@tanstack/react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ============================================
// TYPES
// ============================================

export interface DiscussionCardProps {
  discussion: {
    id: string
    title: string | null
    body: string
    entityType: string
    entityId: string
    author?: {
      username: string
      name: string | null
      role: string | null
    } | null
    isAnonymous: boolean
    upvotes: number
    downvotes: number
    replyCount: number
    createdAt: Date
    entityInfo?: {
      name: string
      slug: string | null
    } | null
  }
  showEntityInfo?: boolean
}

// ============================================
// COMPONENT
// ============================================

function EntityLink({
  entityType,
  slug,
  entityName,
  icon,
}: {
  entityType: string
  slug: string
  entityName: string
  icon: string
}) {
  switch (entityType) {
    case 'organization':
      return (
        <Link
          to="/organizations/$slug"
          params={{ slug }}
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          {icon} {entityName}
        </Link>
      )
    case 'technology':
      return (
        <Link
          to="/technologies/$slug"
          params={{ slug }}
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          {icon} {entityName}
        </Link>
      )
    case 'capability':
      return (
        <Link
          to="/capabilities/$slug"
          params={{ slug }}
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          {icon} {entityName}
        </Link>
      )
    case 'capability_subtype':
      return (
        <Link
          to="/capabilities/$slug/$subslug"
          params={{ slug: entityName.split(' ')[0], subslug: slug }}
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          {icon} {entityName}
        </Link>
      )
    case 'job':
      return (
        <Link
          to="/jobs/$slug"
          params={{ slug }}
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          {icon} {entityName}
        </Link>
      )
    case 'impact_report':
      return (
        <Link
          to="/reports/$id"
          params={{ id: slug }}
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          {icon} {entityName}
        </Link>
      )
    default:
      return (
        <span>
          {icon} {entityName}
        </span>
      )
  }
}

export function DiscussionCard({
  discussion,
  showEntityInfo = true,
}: DiscussionCardProps) {
  const score = discussion.upvotes - discussion.downvotes
  const timeAgo = getTimeAgo(discussion.createdAt)

  // Get entity label and icon
  const entityInfo = getEntityInfo(discussion.entityType)

  // Get author display
  const authorDisplay = discussion.isAnonymous
    ? 'Anonymous'
    : discussion.author?.username || 'Unknown'
  const authorBadge =
    !discussion.isAnonymous && discussion.author?.role
      ? discussion.author.role
      : null

  // Truncate body for preview
  const bodyPreview =
    discussion.body.length > 200
      ? discussion.body.slice(0, 200) + '...'
      : discussion.body

  return (
    <div className="bg-card border rounded-lg p-6 hover:border-primary/50 transition-colors">
      <div className="flex gap-4">
        {/* Voting */}
        <div className="flex flex-col items-center gap-1 min-w-[60px]">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
          >
            ▲
          </Button>
          <span
            className={cn(
              'text-sm font-medium',
              score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : '',
            )}
          >
            {score > 0 ? '+' : ''}
            {score}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            ▼
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          {discussion.title && (
            <Link
              to="/discussions/$id"
              params={{ id: discussion.id }}
              className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2"
            >
              {discussion.title}
            </Link>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{authorDisplay}</span>
            {authorBadge && <Badge variant="secondary">{authorBadge}</Badge>}
            <span>•</span>
            <span>{timeAgo}</span>
            {showEntityInfo && discussion.entityInfo && (
              <>
                <span>•</span>
                <EntityLink
                  entityType={discussion.entityType}
                  slug={discussion.entityInfo.slug || discussion.entityId}
                  entityName={discussion.entityInfo.name}
                  icon={entityInfo.icon}
                />
              </>
            )}
            <span>•</span>
            <span>💬 {discussion.replyCount} replies</span>
          </div>

          {/* Body preview */}
          <p className="mt-3 text-muted-foreground line-clamp-3">
            {bodyPreview}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-4">
            <Link
              to="/discussions/$id"
              params={{ id: discussion.id }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View discussion →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// HELPERS
// ============================================

function getEntityInfo(entityType: string): {
  icon: string
  label: string
  color: string
} {
  switch (entityType) {
    case 'organization':
      return { icon: '🏢', label: 'Organization', color: 'bg-blue-500/10' }
    case 'technology':
      return { icon: '🤖', label: 'Technology', color: 'bg-purple-500/10' }
    case 'capability':
      return { icon: '🏥', label: 'Capability', color: 'bg-green-500/10' }
    case 'capability_subtype':
      return { icon: '📋', label: 'Sub-capability', color: 'bg-green-500/10' }
    case 'job':
      return { icon: '💼', label: 'Job', color: 'bg-orange-500/10' }
    case 'impact_report':
      return { icon: '📊', label: 'Impact Report', color: 'bg-red-500/10' }
    default:
      return { icon: '💬', label: 'Discussion', color: 'bg-gray-500/10' }
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins}m ago`
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }
  return new Date(date).toLocaleDateString()
}

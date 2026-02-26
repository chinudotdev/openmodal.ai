import { Link } from '@tanstack/react-router'

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
    replyCount: number
    createdAt: Date
    entityInfo?: {
      name: string
      slug: string | null
    } | null
  }
}

// ============================================
// COMPONENT
// ============================================

export function DiscussionCard({ discussion }: DiscussionCardProps) {
  const timeAgo = getTimeAgo(discussion.createdAt)

  // Get entity icon
  const entityIcon = getEntityIcon(discussion.entityType)

  return (
    <div className="bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Title and metadata */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <Link
            to="/discussions/$id"
            params={{ id: discussion.id }}
            className="font-semibold text-base hover:text-primary transition-colors line-clamp-2"
          >
            {discussion.title || 'Discussion'}
          </Link>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span title={discussion.entityType}>{entityIcon}</span>
            <span>•</span>
            <span>{timeAgo}</span>
            <span>•</span>
            <span>💬 {discussion.replyCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// HELPERS
// ============================================

function getEntityIcon(entityType: string): string {
  switch (entityType) {
    case 'organization':
      return '🏢'
    case 'technology':
      return '🤖'
    case 'capability':
      return '🏥'
    case 'capability_subtype':
      return '📋'
    case 'job':
      return '💼'
    case 'impact_report':
      return '📊'
    default:
      return '💬'
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

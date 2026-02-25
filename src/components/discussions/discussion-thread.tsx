import { useForm } from '@tanstack/react-form'

import { z } from 'zod'

import { CreateReplyForm } from './create-reply-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'


// ============================================
// TYPES
// ============================================

export type DiscussionReply = {
  id: string
  body: string
  depth: number
  userId: string
  isAnonymous: boolean
  upvotes: number
  downvotes: number
  replyCount: number
  createdAt: Date
  updatedAt: Date
  author?: {
    username: string
    name: string | null
    role: string | null
  } | null
  replies: Array<DiscussionReply>
}

export interface DiscussionThreadProps {
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
    updatedAt: Date
  }
  replies?: Array<DiscussionReply>
  onReply?: (parentId: string, body: string) => void
  onVote?: (id: string, voteType: 'upvote' | 'downvote') => void
  isLoading?: boolean
}

// ============================================
// COMPONENT
// ============================================

export function DiscussionThread({
  discussion,
  replies = [],
  onReply,
  onVote,
  isLoading = false,
}: DiscussionThreadProps) {
  const score = discussion.upvotes - discussion.downvotes
  const timeAgo = getTimeAgo(discussion.createdAt)

  // Get author display
  const authorDisplay = discussion.isAnonymous
    ? 'Anonymous'
    : discussion.author?.username || 'Unknown'
  const authorBadge =
    !discussion.isAnonymous && discussion.author?.role
      ? discussion.author.role
      : null

  return (
    <div className="space-y-6">
      {/* Main Discussion */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex gap-6">
          {/* Voting */}
          <div className="flex flex-col items-center gap-1 min-w-[70px]">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-lg"
              disabled={!onVote || isLoading}
              onClick={() => onVote?.(discussion.id, 'upvote')}
            >
              ▲
            </Button>
            <span
              className={cn(
                'text-lg font-bold',
                score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : '',
              )}
            >
              {score > 0 ? '+' : ''}
              {score}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-lg"
              disabled={!onVote || isLoading}
              onClick={() => onVote?.(discussion.id, 'downvote')}
            >
              ▼
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Title */}
            {discussion.title && (
              <h1 className="text-2xl font-bold mb-4">{discussion.title}</h1>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {authorDisplay}
              </span>
              {authorBadge && <Badge variant="secondary">{authorBadge}</Badge>}
              <span>•</span>
              <span>{timeAgo}</span>
              {discussion.updatedAt.getTime() !==
                discussion.createdAt.getTime() && (
                <>
                  <span>•</span>
                  <span>Edited {getTimeAgo(discussion.updatedAt)}</span>
                </>
              )}
            </div>

            {/* Body */}
            <div className="prose prose-sm max-w-none mb-6 whitespace-pre-wrap">
              {discussion.body}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                💬 Reply{' '}
                {discussion.replyCount > 0 && `(${discussion.replyCount})`}
              </Button>
              <Button variant="ghost" size="sm">
                Share
              </Button>
              <Button variant="ghost" size="sm">
                Flag
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="space-y-4 pl-4">
          <Separator />
          <h2 className="text-lg font-semibold">{replies.length} Replies</h2>
          <div className="space-y-4">
            {replies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                onReply={onReply}
                onVote={onVote}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reply Form */}
      {onReply && (
        <>
          <Separator />
          <CreateReplyForm
            parentId={discussion.id}
            onSubmit={(data) => onReply(discussion.id, data.body)}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface ReplyItemProps {
  reply: DiscussionReply
  onReply?: (parentId: string, body: string) => void
  onVote?: (id: string, voteType: 'upvote' | 'downvote') => void
  isLoading?: boolean
}

function ReplyItem({ reply, onReply, onVote, isLoading }: ReplyItemProps) {
  const score = reply.upvotes - reply.downvotes
  const timeAgo = getTimeAgo(reply.createdAt)
  const canReply = reply.depth < 2 // Max 3 levels (0, 1, 2)

  // Get author display
  const authorDisplay = reply.isAnonymous
    ? 'Anonymous'
    : (reply.author?.username ?? 'Unknown')
  const authorBadge =
    !reply.isAnonymous && reply.author?.role ? reply.author.role : null

  return (
    <div
      className={cn('bg-card border rounded-lg p-4', reply.depth > 0 && 'ml-8')}
    >
      <div className="flex gap-4">
        {/* Voting */}
        <div className="flex flex-col items-center gap-1 min-w-[50px]">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-sm"
            disabled={!onVote || isLoading}
            onClick={() => onVote?.(reply.id, 'upvote')}
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
            className="h-7 w-7 p-0 text-sm"
            disabled={!onVote || isLoading}
            onClick={() => onVote?.(reply.id, 'downvote')}
          >
            ▼
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{authorDisplay}</span>
            {authorBadge && <Badge variant="secondary">{authorBadge}</Badge>}
            <span>•</span>
            <span>{timeAgo}</span>
          </div>

          {/* Body */}
          <div className="text-sm whitespace-pre-wrap mb-3">{reply.body}</div>

          {/* Actions */}
          {canReply && onReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                // Focus reply form for this parent
                const form = document.querySelector(
                  `[data-reply-parent="${reply.id}"]`,
                ) as HTMLElement
                form.focus()
              }}
            >
              💬 Reply
            </Button>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {reply.replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {reply.replies.map((nestedReply) => (
            <ReplyItem
              key={nestedReply.id}
              reply={nestedReply}
              onReply={onReply}
              onVote={onVote}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}

      {/* Inline Reply Form for this level */}
      {canReply && onReply && (
        <div className="mt-4 ml-[50px]">
          <InlineReplyForm
            parentId={reply.id}
            onSubmit={(data) => onReply(reply.id, data.body)}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  )
}

interface InlineReplyFormProps {
  parentId: string
  onSubmit: (data: { body: string }) => void
  isLoading?: boolean
}

function InlineReplyForm({
  parentId,
  onSubmit,
  isLoading = false,
}: InlineReplyFormProps) {
  const form = useForm({
    defaultValues: {
      body: '',
    },
    validators: {
      onSubmit: z.object({
        body: z.string().min(10, 'Reply must be at least 10 characters'),
      }),
    },
    onSubmit: async ({ value }) => {
      await onSubmit({ body: value.body })
      form.reset()
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="body">
        {(field) => (
          <div className="space-y-2">
            <input
              data-reply-parent={parentId}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Write a reply..."
              className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={!canSubmit || isSubmitting || isLoading}
                >
                  {isSubmitting ? 'Posting...' : 'Reply'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        )}
      </form.Field>
    </form>
  )
}

// ============================================
// HELPERS
// ============================================

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

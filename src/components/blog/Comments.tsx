'use client'

import React, { useState, useEffect } from 'react'
import { CommentForm } from './CommentForm'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/lib/blogHelpers'
import { cn } from '@/lib/utils'
import { ThumbsUp, MessageSquare, Flag } from 'lucide-react'

export interface Author {
  name: string
  email?: string
  website?: string
}

export interface CommentType {
  id: string
  author: Author
  content: string
  createdAt: string
  parentId?: string
  replies?: CommentType[]
}

export interface CommentsProps {
  postId: string
  className?: string
  allowReplies?: boolean
  allowVoting?: boolean
  allowReporting?: boolean
}

export function Comments({
  postId,
  className,
  allowReplies = true,
  allowVoting = true,
  allowReporting = true,
}: CommentsProps) {
  const [comments, setComments] = useState<CommentType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyToId, setReplyToId] = useState<string | null>(null)

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/blog/comment?postId=${postId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch comments')
        }

        const data = await response.json()
        setComments(data.comments || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading comments')
        console.error('Error fetching comments:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [postId])

  const renderComment = (comment: CommentType, level = 0) => {
    // Generate initials for avatar fallback
    const initials = comment.author.name
      ?.split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    // Format date
    const formattedDate = formatDate(comment.createdAt)

    // Determine indentation
    const maxNestingLevel = 3
    const indentLevel = Math.min(level, maxNestingLevel)

    return (
      <div
        key={comment.id}
        className={cn(
          'py-4',
          level > 0 ? 'ml-4 pl-4 border-l' : '',
          level >= maxNestingLevel ? 'ml-0' : '',
        )}
        id={`comment-${comment.id}`}
      >
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar className="h-10 w-10 border">
            <AvatarImage alt={comment.author.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1.5">
            {/* Comment header */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium">{comment.author.name}</div>
              <div className="text-xs text-muted-foreground">{formattedDate}</div>
            </div>

            {/* Comment content */}
            <div className="text-sm">{comment.content}</div>

            {/* Comment actions */}
            <div className="flex items-center gap-4 mt-2">
              {allowVoting && (
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>Like</span>
                </Button>
              )}

              {allowReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1"
                  onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{replyToId === comment.id ? 'Cancel' : 'Reply'}</span>
                </Button>
              )}

              {allowReporting && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1 ml-auto text-muted-foreground"
                  title="Report comment"
                >
                  <Flag className="h-3.5 w-3.5" />
                  <span className="sr-only">Report</span>
                </Button>
              )}
            </div>

            {/* Reply form */}
            {replyToId === comment.id && (
              <div className="mt-4">
                <CommentForm
                  postId={postId}
                  parentCommentId={comment.id}
                  onSuccess={() => setReplyToId(null)}
                  onCancel={() => setReplyToId(null)}
                />
              </div>
            )}

            {/* Nested replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-4">
                {comment.replies.map((reply) => renderComment(reply, level + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      <h2 className="text-2xl font-bold tracking-tight">Comments</h2>

      {/* Comment form */}
      <CommentForm postId={postId} />

      {/* Comments list */}
      <div className="space-y-1">
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner h-6 w-6 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground mt-2">Loading comments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-muted-foreground">{error}</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="divide-y">{comments.map((comment) => renderComment(comment))}</div>
        )}
      </div>
    </div>
  )
}

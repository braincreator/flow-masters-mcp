'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/useToast'

interface Comment {
  id: string
  author: {
    name: string
    email?: string
    website?: string
  }
  content: string
  createdAt: string
  replies?: Comment[]
}

interface CommentFormData {
  name: string
  email: string
  website?: string
  content: string
}

interface BlogCommentsProps {
  postId: string
}

export function BlogComments({ postId }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>()

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
        setComments(data.docs || [])
      } catch (err) {
        setError('Failed to load comments')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [postId])

  // Submit a comment
  const submitComment = async (data: CommentFormData) => {
    try {
      const response = await fetch('/api/blog/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          author: {
            name: data.name,
            email: data.email,
            website: data.website,
          },
          content: data.content,
          ...(replyTo ? { parentComment: replyTo } : {}),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit comment')
      }

      toast({
        title: 'Comment submitted',
        description: 'Your comment has been submitted and is awaiting moderation.',
      })

      reset()
      setReplyTo(null)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to submit comment',
        variant: 'destructive',
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="mt-10">
      <h3 className="text-2xl font-bold mb-6">Comments</h3>

      {/* Comment Form */}
      <Card className="p-6 mb-8">
        <h4 className="text-lg font-medium mb-4">
          {replyTo ? 'Reply to comment' : 'Leave a comment'}
        </h4>
        <form onSubmit={handleSubmit(submitComment)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="Name *"
                {...register('name', { required: 'Name is required' })}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Input
                placeholder="Email *"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email',
                  },
                })}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <Input
              placeholder="Website (optional)"
              type="url"
              {...register('website', {
                pattern: {
                  value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                  message: 'Please enter a valid URL',
                },
              })}
              className={errors.website ? 'border-destructive' : ''}
            />
            {errors.website && (
              <p className="text-destructive text-sm mt-1">{errors.website.message}</p>
            )}
          </div>

          <div>
            <Textarea
              placeholder="Your comment *"
              rows={4}
              {...register('content', {
                required: 'Comment is required',
                minLength: {
                  value: 5,
                  message: 'Comment must be at least 5 characters',
                },
              })}
              className={errors.content ? 'border-destructive' : ''}
            />
            {errors.content && (
              <p className="text-destructive text-sm mt-1">{errors.content.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Comment'}
            </Button>

            {replyTo && (
              <Button type="button" variant="outline" onClick={() => setReplyTo(null)}>
                Cancel Reply
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Comments List */}
      <div className="space-y-6">
        {loading && <p>Loading comments...</p>}

        {error && <p className="text-destructive">{error}</p>}

        {!loading && !error && comments.length === 0 && (
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="border rounded-lg p-5">
            <div className="flex gap-4">
              <Avatar>
                <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <div>
                    <h5 className="font-medium">{comment.author.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(comment.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => setReplyTo(comment.id)}>
                    Reply
                  </Button>
                </div>

                <div className="mt-2">{comment.content}</div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-4 pl-6 border-l">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(reply.author.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <h6 className="font-medium">{reply.author.name}</h6>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(reply.createdAt), 'MMMM d, yyyy')}
                            </span>
                          </div>
                          <div className="mt-1">{reply.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

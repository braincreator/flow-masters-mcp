'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth' // предполагаемый хук для проверки авторизации

interface Comment {
  id: string
  author: {
    name: string
    email?: string
    website?: string
    avatar?: string
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

interface AuthenticatedCommentFormData {
  content: string
}

interface EnhancedBlogCommentsProps {
  postId: string
  locale?: string
}

export function EnhancedBlogComments({ postId, locale = 'en' }: EnhancedBlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const { toast } = useToast()

  // Предполагаем, что у нас есть хук useAuth, который возвращает информацию о пользователе
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const {
    register: registerGuest,
    handleSubmit: handleGuestSubmit,
    reset: resetGuestForm,
    formState: { errors: guestErrors, isSubmitting: guestSubmitting },
  } = useForm<CommentFormData>()

  const {
    register: registerAuth,
    handleSubmit: handleAuthSubmit,
    reset: resetAuthForm,
    formState: { errors: authErrors, isSubmitting: authSubmitting },
  } = useForm<AuthenticatedCommentFormData>()

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

  // Submit a guest comment
  const submitGuestComment = async (data: CommentFormData) => {
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
        title: locale === 'ru' ? 'Комментарий отправлен' : 'Comment submitted',
        description:
          locale === 'ru'
            ? 'Ваш комментарий отправлен и ожидает модерации.'
            : 'Your comment has been submitted and is awaiting moderation.',
      })

      resetGuestForm()
      setReplyTo(null)
    } catch (err) {
      toast({
        title: locale === 'ru' ? 'Ошибка' : 'Error',
        description: err instanceof Error ? err.message : 'Failed to submit comment',
        variant: 'destructive',
      })
    }
  }

  // Submit an authenticated user comment
  const submitAuthComment = async (data: AuthenticatedCommentFormData) => {
    try {
      const response = await fetch('/api/blog/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content: data.content,
          ...(replyTo ? { parentComment: replyTo } : {}),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit comment')
      }

      toast({
        title: locale === 'ru' ? 'Комментарий отправлен' : 'Comment submitted',
        description:
          locale === 'ru'
            ? 'Ваш комментарий успешно добавлен.'
            : 'Your comment has been submitted successfully.',
      })

      resetAuthForm()
      setReplyTo(null)
    } catch (err) {
      toast({
        title: locale === 'ru' ? 'Ошибка' : 'Error',
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
      <h3 className="text-2xl font-bold mb-6">{locale === 'ru' ? 'Комментарии' : 'Comments'}</h3>

      {/* Comment Form */}
      <Card className="p-6 mb-8 comment-form-container">
        <h4 className="text-lg font-medium mb-4">
          {replyTo
            ? locale === 'ru'
              ? 'Ответить на комментарий'
              : 'Reply to comment'
            : locale === 'ru'
              ? 'Оставить комментарий'
              : 'Leave a comment'}
        </h4>

        {!authLoading && (
          <Tabs defaultValue={isAuthenticated ? 'authenticated' : 'guest'}>
            {isAuthenticated ? (
              /* Форма для авторизованных пользователей */
              <form onSubmit={handleAuthSubmit(submitAuthComment)} className="space-y-4">
                {user && (
                  <div className="flex items-center gap-2 mb-4">
                    <Avatar>
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                      ) : (
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )}

                <div>
                  <Textarea
                    placeholder={locale === 'ru' ? 'Ваш комментарий *' : 'Your comment *'}
                    rows={4}
                    {...registerAuth('content', {
                      required: locale === 'ru' ? 'Комментарий обязателен' : 'Comment is required',
                      minLength: {
                        value: 5,
                        message:
                          locale === 'ru'
                            ? 'Комментарий должен содержать минимум 5 символов'
                            : 'Comment must be at least 5 characters',
                      },
                    })}
                    className={authErrors.content ? 'border-destructive' : ''}
                  />
                  {authErrors.content && (
                    <p className="text-destructive text-sm mt-1">{authErrors.content.message}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={authSubmitting}>
                    {authSubmitting
                      ? locale === 'ru'
                        ? 'Отправка...'
                        : 'Submitting...'
                      : locale === 'ru'
                        ? 'Отправить'
                        : 'Submit'}
                  </Button>

                  {replyTo && (
                    <Button type="button" variant="outline" onClick={() => setReplyTo(null)}>
                      {locale === 'ru' ? 'Отменить ответ' : 'Cancel Reply'}
                    </Button>
                  )}
                </div>
              </form>
            ) : (
              /* Форма для гостей */
              <>
                <TabsList className="mb-4">
                  <TabsTrigger value="guest">
                    {locale === 'ru' ? 'Гостевой комментарий' : 'Guest Comment'}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="guest">
                  <form onSubmit={handleGuestSubmit(submitGuestComment)} className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Input
                          placeholder={locale === 'ru' ? 'Имя *' : 'Name *'}
                          {...registerGuest('name', {
                            required: locale === 'ru' ? 'Имя обязательно' : 'Name is required',
                          })}
                          className={guestErrors.name ? 'border-destructive' : ''}
                        />
                        {guestErrors.name && (
                          <p className="text-destructive text-sm mt-1">
                            {guestErrors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Input
                          placeholder={locale === 'ru' ? 'Email *' : 'Email *'}
                          type="email"
                          {...registerGuest('email', {
                            required: locale === 'ru' ? 'Email обязателен' : 'Email is required',
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message:
                                locale === 'ru'
                                  ? 'Пожалуйста, введите корректный email'
                                  : 'Please enter a valid email',
                            },
                          })}
                          className={guestErrors.email ? 'border-destructive' : ''}
                        />
                        {guestErrors.email && (
                          <p className="text-destructive text-sm mt-1">
                            {guestErrors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Input
                          placeholder={
                            locale === 'ru' ? 'Веб-сайт (необязательно)' : 'Website (optional)'
                          }
                          type="url"
                          {...registerGuest('website', {
                            pattern: {
                              value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                              message:
                                locale === 'ru'
                                  ? 'Пожалуйста, введите корректный URL'
                                  : 'Please enter a valid URL',
                            },
                          })}
                          className={guestErrors.website ? 'border-destructive' : ''}
                        />
                        {guestErrors.website && (
                          <p className="text-destructive text-sm mt-1">
                            {guestErrors.website.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Textarea
                          placeholder={locale === 'ru' ? 'Ваш комментарий *' : 'Your comment *'}
                          rows={4}
                          {...registerGuest('content', {
                            required:
                              locale === 'ru' ? 'Комментарий обязателен' : 'Comment is required',
                            minLength: {
                              value: 5,
                              message:
                                locale === 'ru'
                                  ? 'Комментарий должен содержать минимум 5 символов'
                                  : 'Comment must be at least 5 characters',
                            },
                          })}
                          className={guestErrors.content ? 'border-destructive' : ''}
                        />
                        {guestErrors.content && (
                          <p className="text-destructive text-sm mt-1">
                            {guestErrors.content.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={guestSubmitting}>
                        {guestSubmitting
                          ? locale === 'ru'
                            ? 'Отправка...'
                            : 'Submitting...'
                          : locale === 'ru'
                            ? 'Отправить'
                            : 'Submit'}
                      </Button>

                      {replyTo && (
                        <Button type="button" variant="outline" onClick={() => setReplyTo(null)}>
                          {locale === 'ru' ? 'Отменить ответ' : 'Cancel Reply'}
                        </Button>
                      )}
                    </div>
                  </form>
                </TabsContent>
              </>
            )}
          </Tabs>
        )}
      </Card>

      {/* Comments List */}
      <div className="space-y-6 comments-list">
        {loading && (
          <p className="text-center">
            {locale === 'ru' ? 'Загрузка комментариев...' : 'Loading comments...'}
          </p>
        )}

        {error && <p className="text-destructive text-center">{error}</p>}

        {!loading && !error && comments.length === 0 && (
          <p className="text-muted-foreground text-center">
            {locale === 'ru'
              ? 'Пока нет комментариев. Будьте первым, кто оставит комментарий!'
              : 'No comments yet. Be the first to comment!'}
          </p>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="border rounded-lg p-5">
            <div className="flex gap-4">
              <Avatar>
                {comment.author.avatar ? (
                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                ) : (
                  <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                  <div>
                    <h5 className="font-medium">{comment.author.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(comment.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => setReplyTo(comment.id)}>
                    {locale === 'ru' ? 'Ответить' : 'Reply'}
                  </Button>
                </div>

                <div className="mt-2 prose-sm">{comment.content}</div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-4 pl-4 border-l border-border">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          {reply.author.avatar ? (
                            <AvatarImage src={reply.author.avatar} alt={reply.author.name} />
                          ) : (
                            <AvatarFallback className="text-xs">
                              {getInitials(reply.author.name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="flex flex-wrap items-baseline gap-2">
                            <h6 className="font-medium text-sm">{reply.author.name}</h6>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(reply.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="mt-1 text-sm">{reply.content}</div>
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

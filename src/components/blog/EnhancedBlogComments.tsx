'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format, formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { CornerUpLeft } from 'lucide-react'

interface Comment {
  id: string
  author: {
    name: string
    email?: string
    avatar?: string
  }
  content: string
  createdAt: string
  replies?: Comment[]
}

interface CommentFormData {
  name: string
  email: string
  content: string
}

interface AuthenticatedCommentFormData {
  content: string
}

interface EnhancedBlogCommentsProps {
  postId: string
  locale?: string
}

// Отдельный компонент для комментария
interface CommentRendererProps {
  comment: Comment
  isReply?: boolean
  locale: string
  getInitials: (name: string) => string
  onReplyClick: (commentId: string) => void
}

function CommentRenderer({
  comment,
  isReply = false,
  locale,
  getInitials,
  onReplyClick,
}: CommentRendererProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = () => setIsCollapsed(!isCollapsed)

  // Определяем, есть ли ответы, используя non-null assertion
  const hasReplies = comment.replies! && comment.replies!.length > 0

  // Форматируем время
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: locale === 'ru' ? ru : undefined,
  })

  return (
    <div key={comment.id} className={`relative flex space-x-2.5 ${isReply ? 'mt-4' : 'mt-6'}`}>
      {isReply && (
        <div
          className="absolute left-[-6px] top-0 bottom-0 w-[1px] bg-gray-200 dark:bg-gray-700 cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500"
          onClick={toggleCollapse}
          title={locale === 'ru' ? 'Свернуть/Развернуть ветку' : 'Collapse/Expand thread'}
        />
      )}

      <div className="flex-shrink-0 pt-0.5">
        <Avatar className="w-6 h-6">
          {comment.author.avatar ? (
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          ) : (
            <AvatarFallback className="text-xs">{getInitials(comment.author.name)}</AvatarFallback>
          )}
        </Avatar>
      </div>

      <div className="flex-1 group rounded-sm hover:bg-gray-100 dark:hover:bg-gray-800/50 p-1">
        <div
          className="flex items-center gap-2 text-xs mb-0.5 cursor-pointer"
          onClick={toggleCollapse}
        >
          <p className="font-semibold text-foreground hover:underline">{comment.author.name}</p>
          <span className="text-muted-foreground">·</span>
          <time className="text-muted-foreground hover:underline" dateTime={comment.createdAt}>
            {timeAgo}
          </time>
        </div>

        <div className="text-sm text-foreground mt-0.5 cursor-pointer" onClick={toggleCollapse}>
          <p>{comment.content}</p>
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="px-2.5 py-0.5 h-auto text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={(e) => {
              e.stopPropagation()
              onReplyClick(comment.id)
            }}
          >
            <CornerUpLeft className="w-3.5 h-3.5 mr-1" />
            {locale === 'ru' ? 'Ответить' : 'Reply'}
          </Button>
          {isCollapsed && hasReplies && (
            <div className="text-xs text-muted-foreground italic">
              {(() => {
                const replyCount = comment.replies!.length
                return `(${locale === 'ru' ? `${replyCount} ответов скрыто` : `${replyCount} replies hidden`})`
              })()}
            </div>
          )}
        </div>

        {!isCollapsed && hasReplies && (
          <div className="mt-5 pl-0">
            {comment.replies!.map((reply) => (
              <CommentRenderer
                key={reply.id}
                comment={reply}
                isReply={true}
                locale={locale}
                getInitials={getInitials}
                onReplyClick={onReplyClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Отдельный компонент для формы комментария авторизованного пользователя
interface AuthFormProps {
  user: any
  locale: string
  replyTo: string | null
  getInitials: (name: string) => string
  registerAuth: any
  authErrors: any
  authSubmitting: boolean
  handleAuthSubmit: any
  submitAuthComment: any
  setReplyTo: (id: string | null) => void
}

function AuthenticatedCommentForm({
  user,
  locale,
  replyTo,
  getInitials,
  registerAuth,
  authErrors,
  authSubmitting,
  handleAuthSubmit,
  submitAuthComment,
  setReplyTo,
}: AuthFormProps) {
  return (
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
          <Button variant="ghost" onClick={() => setReplyTo(null)}>
            {locale === 'ru' ? 'Отменить ответ' : 'Cancel Reply'}
          </Button>
        )}
      </div>
    </form>
  )
}

// Отдельный компонент для формы комментария гостя
interface GuestFormProps {
  locale: string
  replyTo: string | null
  registerGuest: any
  guestErrors: any
  guestSubmitting: boolean
  handleGuestSubmit: any
  submitGuestComment: any
  setReplyTo: (id: string | null) => void
}

function GuestCommentForm({
  locale,
  replyTo,
  registerGuest,
  guestErrors,
  guestSubmitting,
  handleGuestSubmit,
  submitGuestComment,
  setReplyTo,
}: GuestFormProps) {
  return (
    <form onSubmit={handleGuestSubmit(submitGuestComment)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            placeholder={locale === 'ru' ? 'Имя *' : 'Name *'}
            {...registerGuest('name', {
              required: locale === 'ru' ? 'Имя обязательно' : 'Name is required',
            })}
            className={guestErrors.name ? 'border-destructive' : ''}
          />
          {guestErrors.name && (
            <p className="text-destructive text-sm mt-1">{guestErrors.name.message}</p>
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
                message: locale === 'ru' ? 'Неверный формат Email' : 'Invalid email address',
              },
            })}
            className={guestErrors.email ? 'border-destructive' : ''}
          />
          {guestErrors.email && (
            <p className="text-destructive text-sm mt-1">{guestErrors.email.message}</p>
          )}
        </div>
      </div>
      <div>
        <Textarea
          placeholder={locale === 'ru' ? 'Ваш комментарий *' : 'Your comment *'}
          rows={4}
          {...registerGuest('content', {
            required: locale === 'ru' ? 'Комментарий обязателен' : 'Comment is required',
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
          <p className="text-destructive text-sm mt-1">{guestErrors.content.message}</p>
        )}
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
          <Button variant="ghost" onClick={() => setReplyTo(null)}>
            {locale === 'ru' ? 'Отменить ответ' : 'Cancel Reply'}
          </Button>
        )}
      </div>
    </form>
  )
}

// Основной компонент
export function EnhancedBlogComments({ postId, locale = 'en' }: EnhancedBlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const { toast } = useToast()
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

  // --- Функция для запроса комментариев ---
  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/blog/comment?postId=${postId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }
      const data = await response.json()
      setComments(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load comments')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // --- Загрузка комментариев при монтировании ---
  useEffect(() => {
    fetchComments()
  }, [postId])

  const submitGuestComment = async (data: Omit<CommentFormData, 'website'>) => {
    try {
      const response = await fetch('/api/v1/blog/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          author: {
            name: data.name,
            email: data.email,
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
            ? 'Ваш комментарий успешно добавлен.'
            : 'Your comment has been submitted successfully.',
      })

      resetGuestForm()
      setReplyTo(null)
      fetchComments()
    } catch (err) {
      toast({
        title: locale === 'ru' ? 'Ошибка' : 'Error',
        description: err instanceof Error ? err.message : 'Failed to submit comment',
        variant: 'destructive',
      })
    }
  }

  const submitAuthComment = async (data: AuthenticatedCommentFormData) => {
    try {
      const response = await fetch('/api/v1/blog/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      fetchComments()
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

  const handleReplyClick = (commentId: string) => {
    setReplyTo(commentId)
  }

  const CommentsUI = () => {
    if (loading) {
      return <p>{locale === 'ru' ? 'Загрузка комментариев...' : 'Loading comments...'}</p>
    }

    if (error) {
      return <p className="text-destructive">{error}</p>
    }

    if (comments.length === 0) {
      return <p>{locale === 'ru' ? 'Комментариев пока нет.' : 'No comments yet.'}</p>
    }

    return (
      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentRenderer
            key={comment.id}
            comment={comment}
            locale={locale}
            getInitials={getInitials}
            onReplyClick={handleReplyClick}
          />
        ))}
      </div>
    )
  }

  // Используем явное создание React-элементов
  return React.createElement(
    'div',
    { className: 'mt-10' },
    React.createElement(CommentsUI),
    React.createElement(
      Card,
      { className: 'p-6 mt-8 comment-form-container' },
      React.createElement(
        'h4',
        { className: 'text-lg font-medium mb-4' },
        replyTo
          ? locale === 'ru'
            ? 'Ответить на комментарий'
            : 'Reply to comment'
          : locale === 'ru'
            ? 'Оставить комментарий'
            : 'Leave a comment',
        replyTo &&
          React.createElement(
            Button,
            {
              variant: 'ghost',
              size: 'sm',
              className: 'ml-2',
              onClick: () => setReplyTo(null),
            },
            locale === 'ru' ? 'Отменить' : 'Cancel',
          ),
      ),
      authLoading
        ? React.createElement('p', null, locale === 'ru' ? 'Загрузка формы...' : 'Loading form...')
        : isAuthenticated
          ? React.createElement(AuthenticatedCommentForm, {
              user,
              locale,
              replyTo,
              getInitials,
              registerAuth,
              authErrors,
              authSubmitting,
              handleAuthSubmit,
              submitAuthComment,
              setReplyTo,
            })
          : React.createElement(GuestCommentForm, {
              locale,
              replyTo,
              registerGuest,
              guestErrors,
              guestSubmitting,
              handleGuestSubmit,
              submitGuestComment,
              setReplyTo,
            }),
    ),
  )
}

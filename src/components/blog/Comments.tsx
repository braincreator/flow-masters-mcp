'use client'

import React, { useState } from 'react'
import { CommentForm } from './CommentForm'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/lib/blogHelpers'
import { cn } from '@/lib/utils'
import { ThumbsUp, MessageSquare, Flag, CornerUpLeft } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { useBlog } from '@/providers/BlogProvider'

// Переводы для компонента комментариев
const translations = {
  en: {
    comments: 'Comments',
    allComments: 'All Comments',
    loading: 'Loading comments...',
    noComments: 'No comments yet. Be the first to comment!',
    error: 'Error loading comments',
    reply: 'Reply',
    cancel: 'Cancel',
    like: 'Like',
    report: 'Report',
    commentCount: (count: number) => `${count} ${count === 1 ? 'comment' : 'comments'}`,
    hiddenReplies: (count: number) => `${count} replies hidden`,
    asGuest: 'As Guest',
    asUser: 'As User',
  },
  ru: {
    comments: 'Комментарии',
    allComments: 'Все комментарии',
    loading: 'Загрузка комментариев...',
    noComments: 'Пока нет комментариев. Будьте первым!',
    error: 'Ошибка при загрузке комментариев',
    reply: 'Ответить',
    cancel: 'Отмена',
    like: 'Нравится',
    report: 'Пожаловаться',
    commentCount: (count: number) =>
      `${count} ${count === 1 ? 'комментарий' : count < 5 ? 'комментария' : 'комментариев'}`,
    hiddenReplies: (count: number) =>
      `${count} ${count === 1 ? 'ответ скрыт' : count < 5 ? 'ответа скрыто' : 'ответов скрыто'}`,
    asGuest: 'Как гость',
    asUser: 'Как пользователь',
  },
}

export interface Author {
  name: string
  email?: string
  website?: string
  avatar?: string
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
  locale?: 'en' | 'ru'
}

/**
 * Компонент для отображения отдельного комментария и его ответов
 */
interface CommentItemProps {
  comment: CommentType
  level?: number
  postId: string
  replyToId: string | null
  locale: 'en' | 'ru'
  allowReplies?: boolean
  allowVoting?: boolean
  allowReporting?: boolean
  onReplyClick: (id: string) => void
  onCancelReply: () => void
  onSuccess: () => void
}

function CommentItem({
  comment,
  level = 0,
  postId,
  replyToId,
  locale,
  allowReplies = true,
  allowVoting = false,
  allowReporting = false,
  onReplyClick,
  onCancelReply,
  onSuccess,
}: CommentItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const t = locale === 'ru' ? translations.ru : translations.en

  // Генерируем инициалы для аватара
  const initials = comment.author.name
    ?.split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Форматируем дату
  const formattedDate = formatDate(comment.createdAt)

  // Относительное время для человекочитаемого формата (например, "2 часа назад")
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: locale === 'ru' ? ru : undefined,
  })

  // Определяем максимальную вложенность
  const maxNestingLevel = 3
  const indentLevel = Math.min(level, maxNestingLevel)
  const hasReplies = comment.replies && comment.replies.length > 0

  // Меньший отступ для мобильных и глубокой вложенности
  const nestedOffset = level > 2 ? 'ml-1.5' : level > 1 ? 'ml-2 md:ml-3' : 'ml-3 md:ml-4'

  return (
    <div
      key={comment.id}
      className={cn(
        'py-3 md:py-4 border-border relative',
        level > 0 ? `mt-2 ${nestedOffset} pl-2 md:pl-3 border-l` : 'px-3 md:px-4',
        level >= maxNestingLevel ? 'ml-1.5' : '',
      )}
      id={`comment-${comment.id}`}
    >
      {level > 0 && (
        <div
          className="absolute left-[-1px] top-0 bottom-0 w-[1px] bg-border hover:bg-primary/20 cursor-pointer transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={locale === 'ru' ? 'Свернуть/Развернуть' : 'Collapse/Expand'}
        />
      )}

      <div className="flex gap-2.5">
        {/* Avatar */}
        <Avatar className="h-7 w-7 md:h-8 md:w-8 border border-border shrink-0">
          {comment.author.avatar ? (
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          ) : (
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 space-y-1.5">
          {/* Comment header */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-medium text-sm">{comment.author.name}</div>
            <div className="text-xs text-muted-foreground" title={formattedDate}>
              {timeAgo}
            </div>
          </div>

          {/* Comment content */}
          <div className="text-sm leading-relaxed break-words">{comment.content}</div>

          {/* Comment actions */}
          <div className="flex items-center flex-wrap gap-2 mt-2">
            {allowVoting && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs rounded-md hover:bg-muted"
              >
                <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                <span>{t.like}</span>
              </Button>
            )}

            {allowReplies && (
              <Button
                variant={replyToId === comment.id ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs rounded-md"
                onClick={() => onReplyClick(comment.id)}
              >
                <CornerUpLeft className="h-3.5 w-3.5 mr-1.5" />
                <span>{replyToId === comment.id ? t.cancel : t.reply}</span>
              </Button>
            )}

            {allowReporting && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-md hover:bg-muted ml-auto"
                title={t.report}
              >
                <Flag className="h-3.5 w-3.5" />
                <span className="sr-only">{t.report}</span>
              </Button>
            )}

            {isCollapsed && hasReplies && (
              <div className="text-xs text-muted-foreground italic">
                {t.hiddenReplies(comment.replies!.length)}
              </div>
            )}
          </div>

          {/* Reply form */}
          {replyToId === comment.id && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentCommentId={comment.id}
                onSuccess={() => {
                  onSuccess()
                  onCancelReply()
                }}
                onCancel={onCancelReply}
                locale={locale}
              />
            </div>
          )}

          {/* Nested replies */}
          {!isCollapsed && hasReplies && (
            <div className="mt-3 space-y-2">
              {comment.replies!.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  level={level + 1}
                  postId={postId}
                  replyToId={replyToId}
                  locale={locale}
                  allowReplies={allowReplies}
                  allowVoting={allowVoting}
                  allowReporting={allowReporting}
                  onReplyClick={onReplyClick}
                  onCancelReply={onCancelReply}
                  onSuccess={onSuccess}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function Comments({
  postId,
  className,
  allowReplies = true,
  allowVoting = false,
  allowReporting = false,
  locale = 'en',
}: CommentsProps) {
  const [replyToId, setReplyToId] = useState<string | null>(null)

  // Get user from auth context
  const { user } = useAuth()

  // Get blog context for comments functionality
  const {
    comments,
    isLoadingComments: loading,
    commentError: error,
    fetchComments,
    addComment,
  } = useBlog()

  // Get translations
  const t = locale === 'ru' ? translations.ru : translations.en

  // Fetch comments when component mounts
  React.useEffect(() => {
    fetchComments(postId)
  }, [fetchComments, postId])

  // Handle successful comment submission
  const handleCommentSuccess = () => {
    fetchComments(postId)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Заголовок и счетчик */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">{t.comments}</h2>
        <div className="text-xs text-muted-foreground">{t.commentCount(comments.length)}</div>
      </div>

      {/* Comment form */}
      {user ? (
        <CommentForm
          postId={postId}
          onSuccess={handleCommentSuccess}
          user={user}
          locale={locale}
          addComment={addComment}
        />
      ) : (
        <Tabs defaultValue="guest" className="w-full">
          <TabsList className="mb-3">
            <TabsTrigger value="guest">{t.asGuest}</TabsTrigger>
            {/* В будущем здесь может быть вкладка для авторизации */}
            {/*<TabsTrigger value="user">{t.asUser}</TabsTrigger>*/}
          </TabsList>
          <TabsContent value="guest" className="mt-0">
            <CommentForm
              postId={postId}
              onSuccess={handleCommentSuccess}
              locale={locale}
              addComment={addComment}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-6 rounded-lg border border-border bg-card">
            <div className="spinner h-5 w-5 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground mt-2">{t.loading}</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-sm text-destructive bg-destructive/5 rounded-lg border border-destructive/10 p-4">
            {error}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground bg-muted rounded-lg">
            {t.noComments}
          </div>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden bg-card">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                replyToId={replyToId}
                locale={locale}
                allowReplies={allowReplies}
                allowVoting={allowVoting}
                allowReporting={allowReporting}
                onReplyClick={setReplyToId}
                onCancelReply={() => setReplyToId(null)}
                onSuccess={handleCommentSuccess}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

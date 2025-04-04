'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { BookmarkCheck, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { BlogShareButton } from './BlogShareButton'

interface BlogActionButtonsProps {
  postId: string
  postSlug: string
  locale: string
}

export const BlogActionButtons: React.FC<BlogActionButtonsProps> = ({
  postId,
  postSlug,
  locale,
}) => {
  const router = useRouter()

  const handleSave = () => {
    // Здесь можно сохранить пост в localStorage или отправить запрос на сервер
    localStorage.setItem(`saved_post_${postId}`, 'true')
    toast.success(locale === 'ru' ? 'Статья сохранена!' : 'Post saved!')
  }

  const handleComment = () => {
    // Скролл к списку комментариев, а не к форме
    const commentsList = document.getElementById('comments-list')
    if (commentsList) {
      commentsList.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Если список комментариев не найден, пробуем найти секцию комментариев
      const commentsSection = document.getElementById('comments')
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  // Получаем URL и заголовок для шаринга
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const postUrl = origin ? `${origin}/${locale}/blog/${postSlug}` : ''
  const postTitle = typeof window !== 'undefined' ? document.title : ''

  // Текст при копировании ссылки
  const copyLinkMessage = locale === 'ru' ? 'Ссылка на статью скопирована!' : 'Article link copied!'

  return (
    <div className="flex flex-col gap-2 w-full">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 w-full justify-start"
        onClick={handleSave}
      >
        <BookmarkCheck className="h-4 w-4" />
        <span>{locale === 'ru' ? 'Сохранить' : 'Save'}</span>
      </Button>

      {/* Используем наш новый компонент BlogShareButton */}
      <BlogShareButton
        postUrl={postUrl}
        postTitle={postTitle}
        locale={locale}
        successMessage={copyLinkMessage}
      />

      <Button
        variant="outline"
        size="sm"
        className="gap-2 w-full justify-start"
        onClick={handleComment}
      >
        <MessageCircle className="h-4 w-4" />
        <span>{locale === 'ru' ? 'Комментировать' : 'Comment'}</span>
      </Button>
    </div>
  )
}

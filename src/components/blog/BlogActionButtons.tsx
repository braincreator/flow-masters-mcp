'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { BookmarkCheck, Share2, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
    alert('Пост сохранен!')
  }

  const handleShare = () => {
    // Используем Web Share API если доступно
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      })
    } else {
      // Копируем ссылку в буфер обмена
      navigator.clipboard.writeText(window.location.href)
      alert('Ссылка скопирована в буфер обмена')
    }
  }

  const handleComment = () => {
    // Скролл к секции комментариев
    const commentsSection = document.getElementById('comments')
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

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

      <Button
        variant="outline"
        size="sm"
        className="gap-2 w-full justify-start"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
        <span>{locale === 'ru' ? 'Поделиться' : 'Share'}</span>
      </Button>

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

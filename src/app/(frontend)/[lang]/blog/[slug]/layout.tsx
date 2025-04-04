'use client'

import React, { useEffect } from 'react'
import { trackPostView } from '@/lib/blogHelpers'

interface Props {
  children: React.ReactNode
  params: {
    slug: string
    lang: string
  }
}

export default function BlogPostLayout({ children, params }: Props) {
  // Используем React.use для получения params из Promise
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;
  
  // Используем эффект для отслеживания просмотра только на клиенте
  useEffect(() => {
    // Избегаем многократного отслеживания одного и того же поста в одной сессии
    try {
      const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '[]');
      if (!viewedPosts.includes(slug)) {
        // Вызываем API для обновления метрик
        fetch('/api/blog/post-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug: slug,
          }),
        })
          .then((response) => {
            if (response.ok) {
              // Добавляем пост в просмотренные
              viewedPosts.push(slug);
              sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
            }
          })
          .catch((error) => {
            console.error('Failed to track post view:', error);
          });
      }
    } catch (error) {
      console.error('Error accessing session storage:', error);
    }
  }, [slug]);

  return <>{children}</>;
}

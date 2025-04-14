'use client'

import React, { useEffect, useState } from 'react'

export const ReadingProgressBar: React.FC = () => {
  const [readingProgress, setReadingProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateReadingProgress = () => {
      // Находим элемент статьи или используем весь документ
      const article = document.querySelector('article') || document.body

      if (!article) return

      // Вычисляем текущую позицию и общую высоту
      const articleHeight = article.scrollHeight
      const windowHeight = window.innerHeight
      const currentPosition = window.scrollY

      // Рассчитываем процент прочитанного
      const totalHeight = articleHeight - windowHeight
      const scrollPercentage = (currentPosition / totalHeight) * 100

      // Обновляем состояние с ограничением от 0 до 100
      setReadingProgress(Math.min(100, Math.max(0, scrollPercentage)))

      // Показываем прогресс-бар только если прокрутили хотя бы немного
      setIsVisible(currentPosition > 50)
    }

    // Добавляем слушатель события прокрутки
    window.addEventListener('scroll', updateReadingProgress)

    // Инициализируем при загрузке
    updateReadingProgress()

    // Очищаем слушатель при размонтировании компонента
    return () => {
      window.removeEventListener('scroll', updateReadingProgress)
    }
  }, [])

  // Создаем кнопку для прокрутки вверх страницы
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <>
      {/* Индикатор прогресса чтения */}
      <div
        className="blog-reading-progress"
        style={{
          width: `${readingProgress}%`,
          opacity: isVisible ? 1 : 0,
          transition: 'width 0.3s ease, opacity 0.3s ease',
        }}
        role="progressbar"
        aria-valuenow={readingProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </>
  )
}

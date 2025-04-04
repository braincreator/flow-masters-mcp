'use client'

import React, { useEffect, useState, useRef } from 'react'
import { cn } from '@/utilities/ui'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  contentSelector: string
  className?: string
  title?: string
  maxDepth?: number
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  contentSelector,
  className,
  title = 'Содержание',
  maxDepth = 3,
}) => {
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Получаем все заголовки из контента
  useEffect(() => {
    const contentElement = document.querySelector(contentSelector)
    if (!contentElement) return

    // Находим все заголовки от h1 до h{maxDepth}
    const headingElements = Array.from(
      contentElement.querySelectorAll(`h1, h2, h3, h4, h5, h6`),
    ).filter((el) => {
      const level = parseInt(el.tagName.charAt(1))
      return level <= maxDepth
    })

    // Обрабатываем заголовки
    const items: TOCItem[] = headingElements.map((element) => {
      // Добавляем id если его нет
      if (!element.id) {
        element.id =
          element.textContent
            ?.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '') || `heading-${Math.random().toString(36).substring(2, 9)}`
      }

      return {
        id: element.id,
        text: element.textContent || '',
        level: parseInt(element.tagName.charAt(1)),
      }
    })

    setHeadings(items)
  }, [contentSelector, maxDepth])

  // Следим за видимыми заголовками при прокрутке
  useEffect(() => {
    if (headings.length === 0) return

    const observerOptions = {
      rootMargin: '-70px 0px -30% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    }

    // Функция обработки пересечений
    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Находим все видимые заголовки
      const visibleHeadings = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => entry.target.id)

      // Если есть видимые заголовки, устанавливаем активный
      if (visibleHeadings.length > 0) {
        // Берем первый видимый заголовок как активный
        setActiveId(visibleHeadings[0])
      }
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Наблюдаем за всеми заголовками
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  // Обновляем положение индикатора при изменении активного заголовка
  useEffect(() => {
    if (!indicatorRef.current || !listRef.current || !activeId) return

    const activeItem = listRef.current.querySelector(`[data-id="${activeId}"]`)
    if (!activeItem) return

    // Получаем позицию активного элемента относительно списка
    const itemRect = activeItem.getBoundingClientRect()
    const listRect = listRef.current.getBoundingClientRect()
    const offsetTop = itemRect.top - listRect.top

    // Обновляем положение и высоту индикатора
    indicatorRef.current.style.top = `${offsetTop}px`
    indicatorRef.current.style.height = `${itemRect.height}px`
  }, [activeId])

  // Если нет заголовков, ничего не выводим
  if (headings.length === 0) return null

  // Прокрутка к заголовку
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (!element) return

    // Получаем положение элемента
    const rect = element.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const targetPosition = rect.top + scrollTop - 100 // Отступ сверху для удобства чтения

    // Плавная прокрутка
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    })

    // Устанавливаем активный ID для мгновенного обновления UI
    setActiveId(id)
  }

  return (
    <nav
      className={cn(
        'relative rounded-lg p-4 bg-muted/30',
        isCollapsed ? 'max-h-14 overflow-hidden' : 'max-h-[70vh] overflow-y-auto',
        className,
      )}
      aria-label="Содержание статьи"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">{title}</h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground"
          aria-label={isCollapsed ? 'Развернуть содержание' : 'Свернуть содержание'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          >
            {isCollapsed ? (
              <polyline points="6 9 12 15 18 9"></polyline>
            ) : (
              <polyline points="18 15 12 9 6 15"></polyline>
            )}
          </svg>
        </button>
      </div>

      <div className="relative">
        {/* Индикатор активного пункта */}
        <div ref={indicatorRef} className="blog-toc-active-indicator" aria-hidden="true" />

        <ul
          ref={listRef}
          className="space-y-1 transition-all duration-300"
          style={{ opacity: isCollapsed ? 0 : 1 }}
        >
          {headings.map((heading) => (
            <li key={heading.id} style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToHeading(heading.id)
                }}
                className={cn(
                  'blog-toc-item block py-1 text-sm',
                  activeId === heading.id ? 'active' : 'text-muted-foreground',
                )}
                data-id={heading.id}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

'use client'

import React, { useEffect, useState, useRef } from 'react'
import { cn } from '@/utilities/ui'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface VisibleHeading {
  id: string
  visibilityRatio: number
  documentOrder: number
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
  const [visibleHeadings, setVisibleHeadings] = useState<VisibleHeading[]>([])
  const headingElementsRef = useRef<HTMLElement[]>([])

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
    }) as HTMLElement[]

    // Сохраняем ссылки на DOM-элементы заголовков
    headingElementsRef.current = headingElements

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

    // Удаляем пустые заголовки и те, что состоят только из пробелов
    const filteredItems = items.filter((item) => item.text.trim().length > 0)

    // Если есть хотя бы один заголовок, устанавливаем первый как активный по умолчанию
    if (filteredItems.length > 0 && !activeId) {
      setActiveId(filteredItems[0].id)
    }

    setHeadings(filteredItems)
  }, [contentSelector, maxDepth, activeId])

  // Следим за видимыми заголовками при прокрутке
  useEffect(() => {
    if (headings.length === 0) return

    // Настройки для более точного определения видимости
    const observerOptions = {
      // Расширяем верхнюю область наблюдения (80px выше окна) и сужаем нижнюю (60% ниже)
      rootMargin: '-80px 0px -60% 0px',
      // Более детальные уровни пересечения
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    }

    // Функция обработки пересечений
    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Обновляем информацию о видимых заголовках с их коэффициентами видимости и позицией в документе
      const newVisibleHeadings: VisibleHeading[] = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => {
          const headingElement = entry.target as HTMLElement
          const documentOrder = headingElementsRef.current.indexOf(headingElement)

          return {
            id: headingElement.id,
            visibilityRatio: entry.intersectionRatio,
            documentOrder: documentOrder >= 0 ? documentOrder : 999,
          }
        })

      setVisibleHeadings(newVisibleHeadings)
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Наблюдаем за всеми заголовками
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  // Обновляем активный заголовок на основе видимых заголовков и их характеристик
  useEffect(() => {
    if (visibleHeadings.length === 0) return

    let bestHeading: VisibleHeading = visibleHeadings[0]

    // Определяем лучший заголовок на основе различных факторов
    // 1. Приоритет заголовкам в верхней части экрана (выше = лучше)
    // 2. Если видимость примерно одинакова, выбираем заголовок, который ближе к началу документа
    for (const heading of visibleHeadings) {
      // Если текущий заголовок имеет значительно лучшую видимость, выбираем его
      if (heading.visibilityRatio > bestHeading.visibilityRatio + 0.2) {
        bestHeading = heading
      }
      // Если видимость примерно одинакова, но заголовок находится раньше в документе
      else if (
        Math.abs(heading.visibilityRatio - bestHeading.visibilityRatio) <= 0.2 &&
        heading.documentOrder < bestHeading.documentOrder
      ) {
        bestHeading = heading
      }
    }

    // Если активный заголовок изменился, обновляем его
    if (bestHeading.id !== activeId) {
      setActiveId(bestHeading.id)

      // Прокручиваем список, чтобы активный элемент был виден
      const activeElement = document.querySelector(`[data-id="${bestHeading.id}"]`)
      if (activeElement && listRef.current) {
        const listRect = listRef.current.getBoundingClientRect()
        const activeRect = activeElement.getBoundingClientRect()

        // Если активный элемент вне видимой области списка, прокручиваем к нему
        if (activeRect.bottom > listRect.bottom || activeRect.top < listRect.top) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }
    }
  }, [visibleHeadings, activeId])

  // Обновляем положение индикатора при изменении активного заголовка
  useEffect(() => {
    if (!indicatorRef.current || !listRef.current || !activeId) return

    const activeItem = listRef.current.querySelector(`[data-id="${activeId}"]`)
    if (!activeItem) return

    // Получаем позицию активного элемента относительно списка
    const itemRect = activeItem.getBoundingClientRect()
    const listRect = listRef.current.getBoundingClientRect()
    const offsetTop = itemRect.top - listRect.top

    // Обновляем положение и высоту индикатора с плавной анимацией
    requestAnimationFrame(() => {
      if (indicatorRef.current) {
        indicatorRef.current.style.top = `${offsetTop}px`
        indicatorRef.current.style.height = `${itemRect.height}px`
        indicatorRef.current.style.opacity = '1'
      }
    })
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
        'relative rounded-lg p-4 shadow-sm transition-all duration-300 toc-container border border-border/40',
        isCollapsed ? 'max-h-14 overflow-hidden' : 'max-h-[70vh]',
        className,
      )}
      style={{
        background: 'linear-gradient(to bottom, var(--muted), var(--background))',
      }}
      aria-label="Содержание статьи"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="12" x2="14" y2="12"></line>
            <line x1="4" y1="18" x2="18" y2="18"></line>
          </svg>
          {title}
        </h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
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
        <div
          ref={indicatorRef}
          className="absolute left-0 w-1.5 bg-primary rounded-full opacity-0 transition-all duration-300 toc-indicator shadow-md"
          aria-hidden="true"
        />

        <div
          className={cn(
            'transition-all duration-300',
            isCollapsed ? 'opacity-0' : 'opacity-100',
            'custom-scrollbar overflow-y-auto pr-1 max-h-[60vh]',
          )}
        >
          <ul ref={listRef} className="space-y-1 pl-1.5">
            {headings.map((heading) => {
              // Вычисляем отступ с учетом уровня заголовка
              const indent = (heading.level - 1) * 10

              return (
                <li
                  key={heading.id}
                  className={cn(
                    'relative toc-item group py-0.5',
                    `toc-level-${heading.level}`,
                    activeId === heading.id && 'active-heading',
                  )}
                  style={{ paddingLeft: `${indent}px` }}
                >
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToHeading(heading.id)
                    }}
                    className={cn(
                      'block text-sm transition-colors duration-200 leading-tight py-1 px-2 rounded',
                      activeId === heading.id
                        ? 'text-primary font-medium bg-primary/5'
                        : 'text-foreground/70 hover:text-foreground hover:bg-muted/50',
                    )}
                    data-id={heading.id}
                  >
                    <span className="toc-item-number inline-block w-4 mr-1 text-xs font-mono text-primary/60">
                      {heading.level === 1 ? '§' : heading.level === 2 ? '›' : '•'}
                    </span>
                    <span className="toc-item-text">{heading.text.trim()}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </nav>
  )
}

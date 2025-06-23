"use client"
'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { GridContainer } from '@/components/GridContainer'
import type { TableOfContentsBlock as TableOfContentsBlockType } from '@/types/blocks'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
type HeadingLevel = 1 | 2 | 3 | 4

interface Heading {
  id: string
  text: string
  level: HeadingLevel
}

interface TableOfContentsProps extends TableOfContentsBlockType {
  className?: string
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  title = 'Table of Contents',
  autoGenerate = true,
  items = [],
  sticky = false,
  settings,
  className,
}) => {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (!autoGenerate) return

    const article = document.querySelector('article')
    if (!article) {
      logWarn('TableOfContents: No article element found')
      return
    }

    const headingElements = article.querySelectorAll<HTMLHeadingElement>('h2, h3, h4')
    const extractedHeadings: Heading[] = Array.from(headingElements)
      .filter((el) => el.id && el.textContent)
      .map((el) => ({
        id: el.id,
        text: el.textContent || '',
        level: parseInt(el.tagName.charAt(1)) as HeadingLevel,
      }))

    setHeadings(extractedHeadings)
  }, [autoGenerate])

  useEffect(() => {
    if (!autoGenerate || headings.length === 0) return

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '0px 0px -80% 0px',
    })

    const elements = headings.map((heading) => document.getElementById(heading.id)).filter(Boolean)
    elements.forEach((element) => element && observer.observe(element))

    return () => observer.disconnect()
  }, [headings, autoGenerate])

  const tocItems = autoGenerate
    ? headings
    : items.map((item) => ({
        id: item.anchor,
        text: item.title,
        level: item.level as HeadingLevel,
      }))

  if (tocItems.length === 0) return null

  return (
    <GridContainer settings={settings}>
      <nav
        className={cn(
          'w-full max-w-xs mx-auto my-8 p-4 border rounded-lg bg-card',
          sticky && 'lg:sticky lg:top-24',
          className,
        )}
        aria-label="Table of contents"
        role="navigation"
      >
        {title && (
          <h2 className="text-lg font-medium mb-4" id="toc-title">
            {title}
          </h2>
        )}

        <ul className="space-y-2" aria-labelledby="toc-title">
          {tocItems.map((item) => (
            <li
              key={item.id}
              className={cn('transition-colors', {
                'pl-0': item.level === 1,
                'pl-4': item.level === 2,
                'pl-8': item.level === 3,
              })}
            >
              <a
                href={`#${item.id}`}
                className={cn(
                  'block text-sm py-1 hover:text-primary transition-colors',
                  activeId === item.id ? 'text-primary font-medium' : 'text-muted-foreground',
                )}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
                  setActiveId(item.id)
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </GridContainer>
  )
}

export default TableOfContents

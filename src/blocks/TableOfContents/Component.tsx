'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { GridContainer } from '@/components/GridContainer'
import { TableOfContentsBlock } from '@/types/blocks'

type Heading = {
  id: string
  text: string
  level: number
}

export const TableOfContentsBlock: React.FC<TableOfContentsBlock> = ({
  title = 'Table of Contents',
  autoGenerate = true,
  items = [],
  sticky = false,
  settings,
}) => {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // Auto-generate TOC from article headings if enabled
  useEffect(() => {
    if (!autoGenerate) return

    // Find all h2, h3, h4 elements in the article content
    const article = document.querySelector('article')
    if (!article) return

    const headingElements = article.querySelectorAll('h2, h3, h4')
    const extractedHeadings: Heading[] = []

    headingElements.forEach((el) => {
      // Skip headings without id
      if (!el.id) return

      // Extract heading info
      extractedHeadings.push({
        id: el.id,
        text: el.textContent || '',
        level: parseInt(el.tagName.charAt(1)),
      })
    })

    setHeadings(extractedHeadings)
  }, [autoGenerate])

  // Track active heading on scroll
  useEffect(() => {
    if (!autoGenerate || headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '0px 0px -80% 0px' },
    )

    // Observe all headings
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    })

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id)
        if (element) observer.unobserve(element)
      })
    }
  }, [headings, autoGenerate])

  // Use manual items or auto-generated headings
  const tocItems = autoGenerate
    ? headings
    : items.map((item) => ({
        id: item.anchor,
        text: item.title,
        level: item.level,
      }))

  if (tocItems.length === 0) return null

  return (
    <GridContainer settings={settings}>
      <nav
        className={cn(
          'w-full max-w-xs mx-auto my-8 p-4 border rounded-lg bg-card',
          sticky && 'lg:sticky lg:top-24',
        )}
        aria-label="Table of contents"
      >
        {title && <h2 className="text-lg font-medium mb-4">{title}</h2>}

        <ul className="space-y-2">
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

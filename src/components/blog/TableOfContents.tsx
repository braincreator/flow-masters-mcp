'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { extractHeadingsFromContent } from '@/lib/blogHelpers'

export interface HeadingItem {
  id: string
  text: string
  level: number
}

export interface TableOfContentsProps {
  content: any // The MDX/content object
  className?: string
  maxDepth?: number
  minHeadings?: number
  scrollOffset?: number
  collapsible?: boolean
  initiallyCollapsed?: boolean
  title?: string
}

export function TableOfContents({
  content,
  className,
  maxDepth = 3,
  minHeadings = 2,
  scrollOffset = 100,
  collapsible = true,
  initiallyCollapsed = false,
  title = 'Table of Contents',
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed)

  // Extract headings from content
  useEffect(() => {
    if (!content) return

    const extractedHeadings = extractHeadingsFromContent(content).filter(
      (heading) => heading.level <= maxDepth,
    )

    setHeadings(extractedHeadings)
  }, [content, maxDepth])

  // Track active heading based on scroll position
  useEffect(() => {
    if (headings.length === 0) return

    const headingElements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter(Boolean) as HTMLElement[]

    const onScroll = () => {
      const scrollY = window.scrollY

      // Find the heading that is currently in view
      const currentHeading = headingElements
        .filter((el) => el.offsetTop < scrollY + scrollOffset)
        .pop()

      if (currentHeading) {
        setActiveId(currentHeading.id)
      } else if (headingElements.length > 0) {
        setActiveId(headingElements[0].id)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // Call once to set initial state

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [headings, scrollOffset])

  // Don't render if there aren't enough headings
  if (headings.length < minHeadings) {
    return null
  }

  return (
    <div className={cn('bg-muted/50 rounded-lg p-4', className)}>
      {/* Title and toggle button */}
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">{title}</h4>

        {collapsible && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:text-foreground"
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? 'Expand table of contents' : 'Collapse table of contents'}
          >
            <svg
              className={cn(
                'h-4 w-4 transition-transform',
                isCollapsed ? 'rotate-0' : 'rotate-180',
              )}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        )}
      </div>

      {/* TOC List */}
      {!isCollapsed && (
        <nav>
          <ul className="space-y-1 text-sm">
            {headings.map((heading) => {
              const isActive = activeId === heading.id
              const indentLevel = heading.level - 1 // H1 has no indent

              return (
                <li
                  key={heading.id}
                  className={cn(
                    'transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                  )}
                  style={{ paddingLeft: `${indentLevel * 0.75}rem` }}
                >
                  <a
                    href={`#${heading.id}`}
                    className={cn('block py-1 hover:underline', isActive ? 'font-medium' : '')}
                    onClick={(e) => {
                      e.preventDefault()
                      const element = document.getElementById(heading.id)
                      if (element) {
                        const y =
                          element.getBoundingClientRect().top + window.scrollY - scrollOffset
                        window.scrollTo({ top: y, behavior: 'smooth' })
                        // Update URL hash without causing a jump
                        history.pushState(null, '', `#${heading.id}`)
                        setActiveId(heading.id)
                      }
                    }}
                  >
                    {heading.text}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </div>
  )
}

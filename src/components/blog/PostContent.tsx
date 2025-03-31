'use client'

import React, { useEffect, useRef } from 'react'
import { highlightCodeBlocks } from '@/lib/highlightCode'
import 'highlight.js/styles/github-dark.css'
import { ClassValue, cn } from '@/lib/utils'
import RichText from '@/components/RichText'
import { useInView } from 'react-intersection-observer'
import { highlightCode } from '@/utilities/highlightCode'

interface PostContentProps {
  content: any // Rich text content from CMS
  postId?: string // ID of the post for tracking metrics
  className?: ClassValue
  enableCodeHighlighting?: boolean
  enableLineNumbers?: boolean
  enhanceHeadings?: boolean
}

/**
 * Component for rendering blog post content with enhancements
 */
const PostContent: React.FC<PostContentProps> = ({
  content,
  postId,
  className,
  enableCodeHighlighting = true,
  enableLineNumbers = true,
  enhanceHeadings = true,
}) => {
  const contentRef = useRef<HTMLDivElement>(null)

  // Process content once mounted
  useEffect(() => {
    if (!contentRef.current) return

    // Apply code highlighting
    if (enableCodeHighlighting) {
      highlightCodeBlocks(contentRef.current, {
        addCopyButton: true,
        lineNumbers: enableLineNumbers,
      })
    }

    // Add IDs to headings for linking
    if (enhanceHeadings && contentRef.current) {
      const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.forEach((heading) => {
        if (!heading.id && heading.textContent) {
          // Generate ID from heading text
          const id = heading.textContent
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')

          heading.id = id

          // Add anchor link
          const anchor = document.createElement('a')
          anchor.href = `#${id}`
          anchor.className = 'heading-anchor'
          anchor.innerHTML = '<span>#</span>'
          anchor.title = 'Direct link to heading'

          heading.appendChild(anchor)
        }
      })
    }
  }, [content, enableCodeHighlighting, enableLineNumbers, enhanceHeadings])

  // Track time spent reading by sections
  const { ref: section1Ref, inView: section1InView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  })

  const { ref: section2Ref, inView: section2InView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  })

  // Track reading progress for analytics
  useEffect(() => {
    if (section1InView && postId) {
      try {
        // Analytics tracking for 25% read
        fetch('/api/blog/metrics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId,
            action: 'progress',
            progress: 25,
          }),
        })
      } catch (error) {
        console.error('Failed to track reading progress:', error)
      }
    }
  }, [section1InView, postId])

  useEffect(() => {
    if (section2InView && postId) {
      try {
        // Analytics tracking for 75% read
        fetch('/api/blog/metrics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId,
            action: 'progress',
            progress: 75,
          }),
        })
      } catch (error) {
        console.error('Failed to track reading progress:', error)
      }
    }
  }, [section2InView, postId])

  // Set up tracking of complete read when user reaches the bottom
  useEffect(() => {
    if (!postId) return

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // If scrolled to 95% of the content
      if (scrollPosition > documentHeight * 0.95) {
        try {
          // Analytics tracking for completed read
          fetch('/api/blog/metrics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              postId,
              action: 'progress',
              progress: 100,
            }),
          })
          // Remove event listener after tracking completion once
          window.removeEventListener('scroll', handleScroll)
        } catch (error) {
          console.error('Failed to track reading completion:', error)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [postId])

  // Render content based on its type
  const renderContent = () => {
    if (!content) return <div className="empty-content">No content available</div>

    // If content is already HTML
    if (typeof content === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: content }} />
    }

    // If using Payload CMS rich text renderer component
    if (typeof content === 'object' && content !== null) {
      // This should be replaced with your CMS's rich text renderer
      // For example, with Payload CMS:
      // return <RichText data={content} />

      // Fallback for demo purposes:
      return <div>Please implement your CMS's rich text renderer here</div>
    }

    return <div className="error-content">Unsupported content format</div>
  }

  return (
    <>
      <div
        ref={contentRef}
        className={cn(
          'prose prose-lg dark:prose-invert max-w-none',
          // Custom prose styling
          'prose-headings:font-bold prose-headings:tracking-tight',
          'prose-h1:text-3xl prose-h1:font-extrabold md:prose-h1:text-4xl',
          'prose-h2:text-2xl prose-h2:font-bold md:prose-h2:text-3xl',
          'prose-h3:text-xl prose-h3:font-bold md:prose-h3:text-2xl',
          'prose-p:text-base md:prose-p:text-lg',
          'prose-pre:bg-gray-800 prose-pre:rounded-lg prose-pre:border prose-pre:border-gray-700',
          'prose-code:text-pink-500 prose-code:before:content-none prose-code:after:content-none',
          'prose-img:rounded-lg prose-img:mx-auto',
          'prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium prose-a:underline-offset-4',
          // Custom blockquote styling
          'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700',
          'prose-blockquote:pl-6 prose-blockquote:italic',
          // Custom list styling
          'prose-li:marker:text-gray-500 dark:prose-li:marker:text-gray-400',
          // Heading anchor styling
          '[&_.heading-anchor]:ml-2 [&_.heading-anchor]:opacity-0 [&_.heading-anchor]:text-gray-400 hover:[&_.heading-anchor]:opacity-100',
          // Pass in additional classes
          className,
        )}
      >
        {renderContent()}
      </div>

      {/* Invisible markers for tracking reading progress */}
      <div
        ref={section1Ref}
        className="h-4 w-full opacity-0 absolute pointer-events-none"
        style={{ top: '25%' }}
        aria-hidden="true"
      />

      <div
        ref={section2Ref}
        className="h-4 w-full opacity-0 absolute pointer-events-none"
        style={{ top: '75%' }}
        aria-hidden="true"
      />
    </>
  )
}

export default PostContent

'use client'

import React, { useEffect, useCallback } from 'react'
import RichText from '@/components/RichText'
import { useInView } from 'react-intersection-observer'
import { highlightCode } from '@/utilities/highlightCode'

interface PostContentProps {
  content: any // This should be the rich text content from the CMS
  postId: string // Add postId to props
}

export function PostContent({ content, postId }: PostContentProps) {
  // Handle code syntax highlighting
  useEffect(() => {
    highlightCode()
  }, [content])

  // Track time spent reading by sections
  const { ref: section1Ref, inView: section1InView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  const { ref: section2Ref, inView: section2InView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  // Track reading progress for analytics
  useEffect(() => {
    if (section1InView) {
      try {
        // Analytics tracking for 25% read
        fetch('/api/v1/blog/metrics', {
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
    if (section2InView) {
      try {
        // Analytics tracking for 75% read
        fetch('/api/v1/blog/metrics', {
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
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // If scrolled to 95% of the content
      if (scrollPosition > documentHeight * 0.95) {
        try {
          // Analytics tracking for completed read
          fetch('/api/v1/blog/metrics', {
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

  // Calculate the approximate middle points for section tracking
  const contentElement = document.getElementById('post-content')
  const contentHeight = contentElement?.clientHeight || 0
  const section1Position = contentHeight * 0.25
  const section2Position = contentHeight * 0.75

  const trackLinkClick = (url: string) => {
    console.log('Track link click:', url)
    fetch('/api/v1/blog/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const trackShare = (platform: string) => {
    console.log('Track share:', platform)
    fetch('/api/v1/blog/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const trackScrollDepth = useCallback(() => {
    // ... logic ...
    console.log(`Track scroll depth: ${depth}%`)
    fetch('/api/v1/blog/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  }, [])

  if (!content) {
    return (
      <div className="my-10 py-8 text-center">
        <p className="text-muted-foreground italic">Content unavailable</p>
      </div>
    )
  }

  return (
    <>
      <div className="rich-text-content">
        <RichText data={content} />
      </div>

      {/* Invisible markers for tracking reading progress */}
      <div
        ref={section1Ref}
        className="h-4 w-full opacity-0 absolute pointer-events-none"
        style={{ top: `${section1Position}px` }}
        aria-hidden="true"
      />

      <div
        ref={section2Ref}
        className="h-4 w-full opacity-0 absolute pointer-events-none"
        style={{ top: `${section2Position}px` }}
        aria-hidden="true"
      />
    </>
  )
}

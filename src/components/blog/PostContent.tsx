'use client'

import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { BlurImage } from '@/components/blog/BlurImage'
import Prism from 'prismjs'
import RichText from '@/components/RichText'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  extractTextFromLexical,
  isLexicalContent,
  normalizeLexicalContent,
  convertPayloadDataToLexical,
} from '@/utilities/lexicalParser'
import SimpleLexicalRenderer from './SimpleLexicalRenderer'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Импортируем наши кастомные стили
import './post-content.css'

// Импортируем необходимые стили для подсветки кода
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-python'
import 'prismjs/plugins/line-numbers/prism-line-numbers'

interface PostContentProps {
  content: any
  postId: string
  className?: string
  enableCodeHighlighting?: boolean
  enableLineNumbers?: boolean
  enhanceHeadings?: boolean
  debugMode?: boolean
}

const PostContent: React.FC<PostContentProps> = ({
  content,
  postId,
  className,
  enableCodeHighlighting = true,
  enableLineNumbers = true,
  enhanceHeadings = true,
  debugMode = false,
}) => {
  let normalizedContent

  try {
    if (isLexicalContent(content)) {
      normalizedContent = normalizeLexicalContent(content)
    } else {
      normalizedContent = convertPayloadDataToLexical(content)
    }
  } catch (error) {
    logError('Ошибка при нормализации контента:', error)

    if (typeof content === 'string') {
      normalizedContent = {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ text: content, type: 'text' }],
              direction: null,
              format: '',
              indent: 0,
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      }
    } else if (content && typeof content === 'object') {
      try {
        const jsonString = JSON.stringify(content)
        normalizedContent = {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [{ text: jsonString, type: 'text' }],
                direction: null,
                format: '',
                indent: 0,
                version: 1,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            version: 1,
          },
        }
      } catch (e) {
        normalizedContent = null
      }
    } else {
      normalizedContent = null
    }
  }

  const hasValidContent =
    normalizedContent && normalizedContent.root && Array.isArray(normalizedContent.root.children)

  if (!hasValidContent) {
    logError('Невалидный контент блога:', content)
    return (
      <div className="py-4 text-center text-muted-foreground">
        <p>Контент не найден или имеет некорректный формат.</p>
      </div>
    )
  }

  useEffect(() => {
    if (enableCodeHighlighting && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        try {
          Prism.highlightAll()
        } catch (e) {
          logError('Ошибка при подсветке кода:', e)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [enableCodeHighlighting])

  useEffect(() => {
    if (!enhanceHeadings || typeof window === 'undefined') return

    const contentElement = document.getElementById(`post-content-${postId}`)
    if (!contentElement) return

    const headings = contentElement.querySelectorAll('h2, h3, h4, h5, h6')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 },
    )

    // Массив созданных элементов для последующей очистки
    const createdAnchors: HTMLAnchorElement[] = []

    headings.forEach((heading) => {
      if (!heading.id) {
        const text = heading.textContent || ''
        heading.id = text
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '')
      }

      // Проверяем, нет ли уже якоря (чтобы избежать дублирования при повторном рендере)
      if (!heading.querySelector('.heading-anchor')) {
        const anchor = document.createElement('a')
        anchor.href = `#${heading.id}`
        anchor.className = 'heading-anchor'
        anchor.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        `
        heading.appendChild(anchor)
        createdAnchors.push(anchor)
      }

      observer.observe(heading)
    })

    return () => {
      // Отключаем наблюдатель
      headings.forEach((heading) => observer.unobserve(heading))
      observer.disconnect()

      // Удаляем созданные якоря, чтобы избежать утечек памяти
      createdAnchors.forEach((anchor) => {
        if (anchor.parentNode) {
          anchor.parentNode.removeChild(anchor)
        }
      })
    }
  }, [enhanceHeadings, postId])

  return (
    <div
      id={`post-content-${postId}`}
      className={cn('post-content-container', className, enableLineNumbers && 'line-numbers')}
    >
      <SimpleLexicalRenderer content={normalizedContent} />
    </div>
  )
}

export default PostContent

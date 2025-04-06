'use client'

import React from 'react'
import { cn } from '@/utilities/ui'
import Link from 'next/link'

interface SimpleLexicalRendererProps {
  content: any
  className?: string
}

/**
 * Простой компонент для рендеринга Lexical контента напрямую
 * Используется как запасной вариант, когда основной рендерер не работает
 */
const SimpleLexicalRenderer: React.FC<SimpleLexicalRendererProps> = ({ content, className }) => {
  // Рекурсивная функция для рендеринга узлов
  const renderNode = (node: any): React.ReactNode => {
    if (!node) return null

    // Обработка текстовых узлов
    if (node.type === 'text') {
      const textContent = node.text || ''

      // Применяем стили в правильном порядке (вложенные стили)
      let styledText = <>{textContent}</>

      if (node.format) {
        if (node.format & 1 || node.bold) styledText = <strong>{styledText}</strong> // Жирный
        if (node.format & 2 || node.italic) styledText = <em>{styledText}</em> // Курсив
        if (node.format & 4 || node.underline) styledText = <u>{styledText}</u> // Подчеркивание
        if (node.format & 8 || node.strikethrough) styledText = <s>{styledText}</s> // Зачеркивание
        if (node.format & 16 || node.code)
          styledText = <code className="inline-code">{styledText}</code> // Код
      }

      return styledText
    }

    // Обработка ссылок (различные форматы)
    if (node.type === 'link') {
      // Извлекаем URL из разных возможных полей
      let url = '#'
      let isInternal = false
      const rel = 'noopener noreferrer'
      let target = '_blank'

      // Приоритет: url > fields.url > fields.href
      if (node.url) {
        url = node.url
      } else if (node.fields) {
        if (node.fields.url) url = node.fields.url
        else if (node.fields.href) url = node.fields.href

        // Обработка внутренних документов
        if (node.fields.doc && typeof node.fields.doc === 'object') {
          const doc = node.fields.doc
          const relationTo = doc.relationTo || 'pages'
          const value = doc.value

          if (typeof value === 'string') {
            url = `/${relationTo}/${value}`
            isInternal = true
          } else if (value && typeof value === 'object' && value.slug) {
            url = relationTo === 'posts' ? `/blog/${value.slug}` : `/${value.slug}`
            isInternal = true
          }
        }

        // Опции ссылки
        if (node.fields.newTab === false) {
          target = '_self'
        }
      }

      // Рендерим дочерние элементы
      const children = node.children?.map((child: any, i: number) => (
        <React.Fragment key={i}>{renderNode(child)}</React.Fragment>
      ))

      // Используем Next.js Link для внутренних ссылок
      if (isInternal) {
        return (
          <Link href={url} className="text-primary hover:underline">
            {children}
          </Link>
        )
      }

      // Обычная ссылка для внешних URL
      return (
        <a href={url} className="text-primary hover:underline" target={target} rel={rel}>
          {children}
        </a>
      )
    }

    // Обработка параграфов
    if (node.type === 'paragraph') {
      const children = node.children?.map((child: any, i: number) => (
        <React.Fragment key={i}>{renderNode(child)}</React.Fragment>
      ))

      // Применяем выравнивание, если указано
      const alignment = node.format || node.alignment || 'left'
      const textAlign =
        alignment === 'center'
          ? 'text-center'
          : alignment === 'right'
            ? 'text-right'
            : alignment === 'justify'
              ? 'text-justify'
              : ''

      return <p className={cn('mb-4', textAlign)}>{children}</p>
    }

    // Обработка заголовков
    if (node.type === 'heading') {
      // tag или level могут быть числом или строкой
      const headingLevel =
        typeof node.tag === 'number'
          ? node.tag
          : typeof node.tag === 'string'
            ? parseInt(node.tag, 10)
            : typeof node.level === 'number'
              ? node.level
              : typeof node.level === 'string'
                ? parseInt(node.level, 10)
                : 2

      const children = node.children?.map((child: any, i: number) => (
        <React.Fragment key={i}>{renderNode(child)}</React.Fragment>
      ))

      // Применяем выравнивание, если указано
      const alignment = node.format || node.alignment || 'left'
      const textAlign =
        alignment === 'center'
          ? 'text-center'
          : alignment === 'right'
            ? 'text-right'
            : alignment === 'justify'
              ? 'text-justify'
              : ''

      switch (headingLevel) {
        case 1:
          return (
            <h1 className={cn('text-3xl font-bold mt-8 mb-4', textAlign)} id={node.id}>
              {children}
            </h1>
          )
        case 2:
          return (
            <h2 className={cn('text-2xl font-bold mt-6 mb-3', textAlign)} id={node.id}>
              {children}
            </h2>
          )
        case 3:
          return (
            <h3 className={cn('text-xl font-bold mt-5 mb-2', textAlign)} id={node.id}>
              {children}
            </h3>
          )
        case 4:
          return (
            <h4 className={cn('text-lg font-bold mt-4 mb-2', textAlign)} id={node.id}>
              {children}
            </h4>
          )
        case 5:
          return (
            <h5 className={cn('text-base font-bold mt-3 mb-1', textAlign)} id={node.id}>
              {children}
            </h5>
          )
        case 6:
          return (
            <h6 className={cn('text-sm font-bold mt-2 mb-1', textAlign)} id={node.id}>
              {children}
            </h6>
          )
        default:
          return (
            <h2 className={cn('text-2xl font-bold mt-6 mb-3', textAlign)} id={node.id}>
              {children}
            </h2>
          )
      }
    }

    // Обработка списков
    if (node.type === 'list') {
      // listType или tag определяют тип списка
      const listType = node.listType || node.tag || 'bullet'

      const listItems = node.children?.map((child: any, i: number) => {
        // Получаем содержимое элемента списка
        const listItemContent = child.children?.map((grandChild: any, j: number) => (
          <React.Fragment key={j}>{renderNode(grandChild)}</React.Fragment>
        ))

        return (
          <li key={i} className="ml-6 mb-1">
            {listItemContent}
          </li>
        )
      })

      if (listType === 'bullet' || listType === 'unordered') {
        return <ul className="list-disc mb-4">{listItems}</ul>
      } else {
        return <ol className="list-decimal mb-4">{listItems}</ol>
      }
    }

    // Обработка элементов списка напрямую
    if (node.type === 'listitem') {
      const children = node.children?.map((child: any, i: number) => (
        <React.Fragment key={i}>{renderNode(child)}</React.Fragment>
      ))

      return <>{children}</>
    }

    // Обработка блока кода
    if (node.type === 'code') {
      // Получаем содержимое кода и язык
      const language = node.language || 'plain'

      let codeContent = ''
      if (typeof node.code === 'string') {
        codeContent = node.code
      } else if (node.children) {
        codeContent = node.children.map((child: any) => child.text || '').join('\n')
      }

      return (
        <pre className="bg-muted p-4 rounded-md mb-4 overflow-x-auto">
          <code className={`language-${language}`}>{codeContent}</code>
        </pre>
      )
    }

    // Обработка цитат
    if (node.type === 'quote') {
      const children = node.children?.map((child: any, i: number) => (
        <React.Fragment key={i}>{renderNode(child)}</React.Fragment>
      ))
      return (
        <blockquote className="border-l-4 border-primary pl-4 mb-4 italic">{children}</blockquote>
      )
    }

    // Обработка горизонтальных разделителей
    if (node.type === 'horizontalrule' || node.type === 'hr') {
      return <hr className="my-6 border-t border-muted-foreground/30" />
    }

    // Обработка изображений
    if (node.type === 'image') {
      const src = node.src || node.url || ''
      const alt = node.alt || node.altText || ''
      const caption = node.caption || ''

      return (
        <figure className="mb-6">
          <img
            src={src}
            alt={alt}
            className="max-w-full h-auto rounded-md mx-auto"
            loading="lazy"
          />
          {caption && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
              {caption}
            </figcaption>
          )}
        </figure>
      )
    }

    // Поддержка блоков
    if (node.type === 'block') {
      // Получаем данные блока из поля data или fields
      const blockData = node.data || node.fields || {}
      const blockType = blockData.blockType || blockData.type

      // Общая отладка блоков
      if (process.env.NODE_ENV === 'development') {
        console.log('Обработка блока:', {
          type: node.type,
          blockType,
          data: blockData,
        })
      }

      // Обработка mediaBlock
      if (blockType === 'mediaBlock' && blockData.media) {
        // Простая обработка медиа блока
        const mediaUrl =
          typeof blockData.media === 'string' ? blockData.media : blockData.media.url || ''

        const mediaAlt = blockData.alt || blockData.caption || ''

        return (
          <figure className="my-6">
            <img
              src={mediaUrl}
              alt={mediaAlt}
              className="max-w-full h-auto rounded-md mx-auto"
              loading="lazy"
            />
            {blockData.caption && (
              <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
                {blockData.caption}
              </figcaption>
            )}
          </figure>
        )
      }

      // Обработка блока banner
      if (blockType === 'banner') {
        // Получаем стиль баннера и контент
        const bannerStyle = blockData.style || 'info'

        // Получаем содержимое баннера
        let bannerContent
        if (blockData.content) {
          if (typeof blockData.content === 'string') {
            bannerContent = blockData.content
          } else if (blockData.content.root && blockData.content.root.children) {
            // Рендерим содержимое как Lexical
            bannerContent = blockData.content.root.children.map((child: any, i: number) => (
              <React.Fragment key={i}>{renderNode(child)}</React.Fragment>
            ))
          } else {
            // Попытка отобразить как простой текст, если структура не распознана
            bannerContent = JSON.stringify(blockData.content)
          }
        } else if (blockData.children && Array.isArray(blockData.children)) {
          // Альтернативная структура - содержимое в children
          bannerContent = blockData.children.map((child: any, i: number) => (
            <React.Fragment key={i}>{renderNode(child)}</React.Fragment>
          ))
        }

        return (
          <div className="mx-auto my-8 w-full">
            <div
              className={cn('border py-3 px-6 rounded flex items-center', {
                'border-border bg-card': bannerStyle === 'info',
                'border-error bg-error/30': bannerStyle === 'error',
                'border-success bg-success/30': bannerStyle === 'success',
                'border-warning bg-warning/30': bannerStyle === 'warning',
              })}
            >
              {bannerContent || (
                <p className="text-muted-foreground italic">Содержимое баннера не найдено</p>
              )}
            </div>
          </div>
        )
      }

      // Если тип блока не распознан, отображаем дочерние элементы
      return blockData.children?.map((child: any, i: number) => (
        <React.Fragment key={i}>{renderNode(child)}</React.Fragment>
      ))
    }

    // Рекурсивный обход дочерних узлов
    if (node.children && Array.isArray(node.children)) {
      return node.children.map((child: any, i: number) => (
        <React.Fragment key={i}>{renderNode(child)}</React.Fragment>
      ))
    }

    // Для неизвестных типов узлов - попытка получить текст
    if (node.text) {
      return node.text
    }

    // В последнюю очередь - для неизвестных узлов возвращаем null
    return null
  }

  // Проверяем входные данные
  if (!content) {
    return <div className="text-red-500">Контент не предоставлен</div>
  }

  // Нормализуем контент, если это строка
  let normalizedContent = content
  if (typeof content === 'string') {
    try {
      normalizedContent = JSON.parse(content)
    } catch {
      return <div className="whitespace-pre-wrap">{content}</div>
    }
  }

  // Проверяем наличие структуры Lexical
  if (!normalizedContent.root && normalizedContent.document) {
    // Поддержка другого формата структуры
    normalizedContent = {
      root: normalizedContent.document,
    }
  }

  const rootNode = normalizedContent.root
  if (!rootNode || !rootNode.children) {
    console.error(
      'SimpleLexicalRenderer: Некорректная структура Lexical контента',
      normalizedContent,
    )
    return (
      <div className="text-red-500">
        Некорректная структура контента
        {process.env.NODE_ENV === 'development' && (
          <pre className="text-xs mt-2 p-2 bg-muted whitespace-pre-wrap overflow-auto">
            {JSON.stringify(normalizedContent, null, 2)}
          </pre>
        )}
      </div>
    )
  }

  // Рендерим контент
  return (
    <div
      className={cn(
        'lexical-content prose dark:prose-invert w-full prose-img:mx-auto max-w-none',
        className,
      )}
    >
      {rootNode.children.map((node: any, i: number) => (
        <React.Fragment key={i}>{renderNode(node)}</React.Fragment>
      ))}
    </div>
  )
}

export default SimpleLexicalRenderer

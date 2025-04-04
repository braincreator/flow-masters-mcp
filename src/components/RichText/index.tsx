import React from 'react'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
} from '@payloadcms/richtext-lexical'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as RichTextWithoutBlocks,
  defaultConverters,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps>
  | HeadingNode
  | ListNode
  | ListItemNode
  | QuoteNode
  | CodeNode

/**
 * Преобразует внутренние документы в ссылки
 */
const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

/**
 * Функция для преобразования узлов Lexical в JSX
 */
const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    banner: ({ node }) => (
      <BannerBlock
        className="col-start-2 mb-4"
        {...node.fields}
        content={
          Array.isArray(node.fields.content)
            ? node.fields.content.filter((c: { type: string }) => c.type !== 'banner')
            : node.fields.content
        } // Prevent nested banners, check if content is array
      />
    ),
    mediaBlock: ({
      value,
      node,
    }: {
      value?: Record<string, any>
      node?: Record<string, any>
    }): React.ReactNode => {
      // Поддержка обоих форматов данных из Lexical
      const fields = value?.fields || node?.fields

      // Проверяем, что поля существуют
      if (!fields) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('RichText mediaBlock: Missing fields in node/value', { value, node })
        }
        return null
      }

      // Валидация медиа
      const isValidMedia = (media: any): boolean => {
        if (!media) return false

        // Для строки URL
        if (typeof media === 'string' && media.trim().length > 0) {
          return true
        }

        // Для объекта с URL
        if (typeof media === 'object' && media !== null) {
          if ('url' in media && typeof media.url === 'string' && media.url.trim().length > 0) {
            return true
          }
        }

        // Для массива
        if (Array.isArray(media) && media.length > 0) {
          const firstItem = media[0]
          if (typeof firstItem === 'string' && firstItem.trim().length > 0) {
            return true
          }
          if (typeof firstItem === 'object' && firstItem !== null && 'url' in firstItem) {
            return typeof firstItem.url === 'string' && firstItem.url.trim().length > 0
          }
        }

        return false
      }

      // Проверяем и обрабатываем различные форматы медиа
      let processedMedia = null

      try {
        const media = fields.media

        if (!media) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('RichText mediaBlock: Missing media field')
          }
          return null
        }

        // Логируем для отладки в режиме разработки
        if (process.env.NODE_ENV === 'development') {
          console.log('RichText mediaBlock:', {
            mediaType: typeof media,
            mediaValue: media,
            isArray: Array.isArray(media),
          })
        }

        // Обрабатываем различные форматы
        if (Array.isArray(media)) {
          // Если массив, берем первый валидный элемент
          processedMedia = media.find((item) => isValidMedia(item)) || null
        } else {
          // Проверяем валидность
          processedMedia = isValidMedia(media) ? media : null
        }

        if (!processedMedia) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('RichText mediaBlock: Invalid media format', media)
          }
          return null
        }
      } catch (error) {
        console.error('Error processing media in RichText:', error)
        return null
      }

      // Рендерим блок с медиа
      return (
        <MediaBlock
          className="col-start-1 col-span-3"
          imgClassName="m-0"
          captionClassName="mx-auto max-w-[48rem]"
          enableGutter={false}
          disableInnerContainer={true}
          media={processedMedia}
          caption={fields.caption}
        />
      )
    },
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
})

type Props = {
  data: SerializedEditorState | any // Поддерживаем гибкие входные данные
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

/**
 * Нормализует данные Lexical для обеспечения совместимости с различными форматами
 */
const normalizeLexicalData = (data: any): SerializedEditorState => {
  // Если данные отсутствуют, возвращаем пустую структуру
  if (!data) {
    return {
      root: {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    }
  }

  // Расширенная проверка вложенных структур
  // Обработка случая, когда контент вложен
  if (data.content && typeof data.content === 'object') {
    return normalizeLexicalData(data.content)
  }

  // Поддержка текста в custom поле
  if (data.custom && typeof data.custom === 'object') {
    if (
      data.custom.root ||
      data.custom.nodes ||
      (data.custom.version &&
        (typeof data.custom.version === 'number' || typeof data.custom.version === 'string'))
    ) {
      return normalizeLexicalData(data.custom)
    }
  }

  // Поддержка текста в text или value полях
  if (data.text && typeof data.text === 'object') {
    return normalizeLexicalData(data.text)
  }

  if (data.value && typeof data.value === 'object') {
    return normalizeLexicalData(data.value)
  }

  // Если данные уже имеют правильную структуру
  if (data.root && typeof data.root === 'object') {
    // Убедимся, что children существует
    if (!data.root.children) {
      data.root.children = []
    }
    return data
  }

  // Если данные имеют формат с nodes вместо root
  if (data.nodes && Array.isArray(data.nodes)) {
    return {
      root: {
        children: data.nodes,
        direction: data.direction || null,
        format: data.format || '',
        indent: data.indent || 0,
        type: 'root',
        version: data.version || 1,
      },
    }
  }

  // Если данные - это строка
  if (typeof data === 'string') {
    try {
      // Пробуем распарсить JSON строку
      const parsedData = JSON.parse(data)
      return normalizeLexicalData(parsedData)
    } catch (e) {
      // Если парсинг не удался, создаем текстовый узел
      return {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: data,
                  type: 'text',
                  version: 1,
                },
              ],
              direction: null,
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      }
    }
  }

  // В других случаях возвращаем структуру по умолчанию
  return {
    root: {
      children: [],
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

/**
 * Компонент RichText для отображения Lexical контента
 */
export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, data, ...rest } = props

  // Нормализуем данные для обеспечения совместимости
  const normalizedData = React.useMemo(() => {
    try {
      return normalizeLexicalData(data)
    } catch (error) {
      console.error('Error normalizing data:', error)

      // В случае ошибки возвращаем простую структуру
      return {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: typeof data === 'string' ? data : 'Error: Could not normalize data',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: null,
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      }
    }
  }, [data])

  // Ограничиваем вывод отладочной информации только для режима разработки
  if (process.env.NODE_ENV === 'development') {
    console.log('RichText component: data received', {
      dataType: typeof data,
      normalizedType: typeof normalizedData,
      hasRoot: Boolean(normalizedData?.root),
      childrenCount: normalizedData?.root?.children?.length || 0,
      firstChildType: normalizedData?.root?.children?.[0]?.type,
    })
  }

  // Если после нормализации нет содержимого, возвращаем пустой контейнер
  const hasContent =
    normalizedData.root &&
    Array.isArray(normalizedData.root.children) &&
    normalizedData.root.children.length > 0

  if (!hasContent) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('RichText: No content to display after normalization', {
        originalData:
          typeof data === 'object'
            ? // Очищаем большие объекты для логирования
              Object.keys(data).reduce((acc: any, key) => {
                acc[key] =
                  typeof data[key] === 'object'
                    ? Array.isArray(data[key])
                      ? `Array[${data[key].length}]`
                      : 'Object'
                    : data[key]
                return acc
              }, {})
            : data,
      })
    }

    return <div className={cn('empty-content', className)} />
  }

  try {
    return (
      <RichTextWithoutBlocks
        key={`rich-text-${Math.random().toString(36).substring(2, 9)}`} // Уникальный ключ, чтобы всегда перерендеривать при изменениях
        value={normalizedData}
        converters={jsxConverters}
        className={cn(
          {
            'container ': enableGutter,
            'max-w-none': !enableGutter,
            'mx-auto prose md:prose-md dark:prose-invert ': enableProse,
          },
          className,
        )}
        {...rest}
      />
    )
  } catch (error) {
    // Логируем ошибку только в режиме разработки
    if (process.env.NODE_ENV === 'development') {
      console.error('Error rendering RichText:', error)
      console.error(
        'Normalized data that caused the error:',
        JSON.stringify(normalizedData).substring(0, 1000) + '...',
      )
    }

    // В продакшене показываем упрощенный режим ошибки
    return process.env.NODE_ENV === 'development' ? (
      <div className="p-4 border border-red-300 rounded bg-red-50 text-red-700">
        <p>
          Ошибка при рендеринге Rich Text содержимого:{' '}
          {error instanceof Error ? error.message : 'Неизвестная ошибка'}
        </p>
        <details>
          <summary className="cursor-pointer mt-2">Структура данных</summary>
          <pre className="mt-1 text-xs whitespace-pre-wrap overflow-auto p-2 bg-red-100 rounded">
            {JSON.stringify(normalizedData, null, 2)}
          </pre>
        </details>
      </div>
    ) : (
      <div className={cn('p-4', className)}>
        <p>Не удалось загрузить контент из-за технической проблемы.</p>
      </div>
    )
  }
}

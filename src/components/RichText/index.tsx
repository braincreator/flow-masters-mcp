import React from 'react'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
} from '@payloadcms/richtext-lexical'
import { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as RichTextWithoutBlocks,
  defaultJSXConverters,
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
const jsxConverters: JSXConvertersFunction<NodeTypes> = () => ({
  ...defaultJSXConverters,
  ...LinkJSXConverter({
    internalDocToHref: ({ linkNode }) => {
      const { value, relationTo } = linkNode.fields.doc!
      if (typeof value !== 'object') {
        throw new Error('Expected value to be an object')
      }
      const slug = value.slug
      return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
    },
  }),
  blocks: {
    banner: ({ node }) => (
      <BannerBlock
        {...node.fields}
        content={
          Array.isArray(node.fields.content)
            ? node.fields.content.filter((c: { type: string }) => c.type !== 'banner')
            : node.fields.content
        }
      />
    ),
    mediaBlock: ({ node }) => {
      const fields = node?.fields
      if (!fields?.media) return null

      return <MediaBlock blockType="media" media={fields.media} />
    },
    code: ({ node }) => <CodeBlock {...node.fields} />,
    cta: ({ node }) => {
      const { richText, actions: rawActions, ...rest } = node.fields
      const actions = rawActions || []
      return <CallToActionBlock content={richText} actions={actions} {...rest} />
    },
  },
})

type Props = {
  data: SerializedEditorState
  className?: string
}

/**
 * Компонент RichText для отображения Lexical контента
 */
export default function RichText({ data, className }: Props) {
  if (!data) return null

  return (
    <RichTextWithoutBlocks
      data={data}
      converters={jsxConverters}
      className={cn('prose dark:prose-invert', className)}
    />
  )
}

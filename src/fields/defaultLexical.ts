import { Config, type TextFieldSingleValidation } from 'payload'
import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  lexicalEditor,
  UnderlineFeature,
  HeadingFeature,
  OrderedListFeature,
  UnorderedListFeature,
  type LinkFields,
} from '@payloadcms/richtext-lexical'

export const defaultLexical: Config['editor'] = lexicalEditor({
  features: () => {
    return [
      ParagraphFeature(),
      UnderlineFeature(),
      BoldFeature(),
      ItalicFeature(),
      HeadingFeature({
        enabledHeadingSizes: ['h2', 'h3', 'h4'],
      }),
      OrderedListFeature(),
      UnorderedListFeature(),
      LinkFeature({
        enabledCollections: ['pages', 'posts'],
        fields: ({ defaultFields }) => {
          const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
            if ('name' in field && field.name === 'url') return false
            return true
          })

          return [
            ...defaultFieldsWithoutUrl,
            {
              name: 'url',
              type: 'text',
              admin: {
                condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
              },
              label: ({ t }) => t('fields:enterURL'),
              required: true,
              validate: ((value, options) => {
                if ((options?.siblingData as LinkFields)?.linkType === 'internal') {
                  return true // no validation needed, as no url should exist for internal links
                }
                return value ? true : 'URL is required'
              }) as TextFieldSingleValidation,
            },
            {
              name: 'appearance',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Default', value: 'default' },
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Outline', value: 'outline' },
                { label: 'Ghost', value: 'ghost' },
                { label: 'Inline', value: 'inline' },
              ],
            },
            {
              name: 'size',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Small', value: 'sm' },
                { label: 'Default', value: 'default' },
                { label: 'Large', value: 'lg' },
              ],
            },
          ]
        },
      }),
    ]
  },
})

/**
 * Базовая конфигурация Lexical Editor для использования вместо пустого lexicalEditor({})
 * Включает основные функции, включая HeadingFeature для предотвращения ошибок парсинга
 */
export const baseLexical: Config['editor'] = lexicalEditor({
  features: () => {
    return [
      ParagraphFeature(),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      HeadingFeature({
        enabledHeadingSizes: ['h2', 'h3', 'h4'],
      }),
      OrderedListFeature(),
      UnorderedListFeature(),
      LinkFeature({
        enabledCollections: ['pages', 'posts'],
      }),
    ]
  },
})

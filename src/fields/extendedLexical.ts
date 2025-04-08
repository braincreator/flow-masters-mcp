import { Config } from 'payload'
import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  lexicalEditor,
  UnderlineFeature,
  HeadingFeature,
  BlocksFeature,
  UploadFeature,
  AlignFeature,
  IndentFeature,
  ListFeature,
  TableFeature,
  RelationshipFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  HorizontalRuleFeature,
  QuoteFeature,
  CodeFeature,
} from '@payloadcms/richtext-lexical'

// Импортируем конфигурации блоков
import { Banner } from '../blocks/Banner/config'
import { Code } from '../blocks/Code/config'
import { MediaBlock } from '../blocks/MediaBlock/config'
import { CallToAction } from '../blocks/CallToAction/config'

/**
 * Расширенная конфигурация Lexical Editor с поддержкой всех доступных функций и блоков
 */
export const extendedLexicalEditor: Config['editor'] = lexicalEditor({
  features: () => {
    return [
      // Базовые функции форматирования текста
      ParagraphFeature(),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      
      // Заголовки и структура
      HeadingFeature({
        enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      }),
      
      // Списки и таблицы
      ListFeature(),
      TableFeature(),
      
      // Выравнивание и отступы
      AlignFeature(),
      IndentFeature(),
      
      // Цитаты и код
      QuoteFeature(),
      CodeFeature(),
      
      // Разделители
      HorizontalRuleFeature(),
      
      // Ссылки и отношения
      LinkFeature({
        enabledCollections: ['pages', 'posts', 'products'],
      }),
      RelationshipFeature({
        enabledCollections: ['pages', 'posts', 'products', 'media'],
      }),
      
      // Загрузка медиа
      UploadFeature({
        collections: {
          media: {
            fields: [
              {
                name: 'caption',
                type: 'text',
                label: 'Подпись',
              },
              {
                name: 'alignment',
                type: 'select',
                label: 'Выравнивание',
                defaultValue: 'center',
                options: [
                  {
                    label: 'Слева',
                    value: 'left',
                  },
                  {
                    label: 'По центру',
                    value: 'center',
                  },
                  {
                    label: 'Справа',
                    value: 'right',
                  },
                ],
              },
              {
                name: 'enableLink',
                type: 'checkbox',
                label: 'Добавить ссылку',
              },
              {
                name: 'link',
                type: 'text',
                label: 'URL ссылки',
                admin: {
                  condition: (_, { enableLink }) => Boolean(enableLink),
                },
              },
            ],
          },
        },
      }),
      
      // Вставка блоков
      BlocksFeature({
        blocks: [
          Banner,
          Code,
          MediaBlock,
          CallToAction,
        ],
      }),
      
      // Панели инструментов
      FixedToolbarFeature(),
      InlineToolbarFeature(),
    ]
  },
})

/**
 * Упрощенная конфигурация Lexical Editor для использования в полях, где не нужны все функции
 */
export const simpleLexicalEditor: Config['editor'] = lexicalEditor({
  features: () => {
    return [
      ParagraphFeature(),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      HeadingFeature({
        enabledHeadingSizes: ['h2', 'h3', 'h4'],
      }),
      LinkFeature({
        enabledCollections: ['pages', 'posts'],
      }),
      ListFeature(),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
    ]
  },
})

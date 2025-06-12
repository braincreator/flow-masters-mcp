import type { GlobalConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: {
    en: 'About Page',
    ru: 'Страница "О нас"',
  },
  access: {
    read: () => true,
  },
  fields: [
    // Hero Section
    {
      name: 'hero',
      type: 'group',
      label: {
        en: 'Hero Section',
        ru: 'Главная секция',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: {
            en: 'Title',
            ru: 'Заголовок',
          },
          localized: true,
          required: true,
        },
        {
          name: 'subtitle',
          type: 'textarea',
          label: {
            en: 'Subtitle',
            ru: 'Подзаголовок',
          },
          localized: true,
          required: true,
        },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
          label: {
            en: 'Background Image',
            ru: 'Фоновое изображение',
          },
        },
      ],
    },
    // Mission Section
    {
      name: 'mission',
      type: 'group',
      label: {
        en: 'Mission Section',
        ru: 'Секция "Миссия"',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: {
            en: 'Title',
            ru: 'Заголовок',
          },
          localized: true,
          required: true,
        },
        {
          name: 'content',
          type: 'richText',
          label: {
            en: 'Content',
            ru: 'Содержание',
          },
          localized: true,
          editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [
                ...rootFeatures,
                HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                FixedToolbarFeature(),
                InlineToolbarFeature(),
              ]
            },
          }),
        },
      ],
    },
    // Stats Section
    {
      name: 'stats',
      type: 'group',
      label: {
        en: 'Statistics Section',
        ru: 'Секция "Статистика"',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: {
            en: 'Title',
            ru: 'Заголовок',
          },
          localized: true,
          required: true,
        },
        {
          name: 'subtitle',
          type: 'text',
          label: {
            en: 'Subtitle',
            ru: 'Подзаголовок',
          },
          localized: true,
        },
        {
          name: 'items',
          type: 'array',
          label: {
            en: 'Statistics Items',
            ru: 'Элементы статистики',
          },
          fields: [
            {
              name: 'value',
              type: 'text',
              label: {
                en: 'Value',
                ru: 'Значение',
              },
              required: true,
            },
            {
              name: 'label',
              type: 'text',
              label: {
                en: 'Label',
                ru: 'Подпись',
              },
              localized: true,
              required: true,
            },
            {
              name: 'description',
              type: 'text',
              label: {
                en: 'Description',
                ru: 'Описание',
              },
              localized: true,
            },
            {
              name: 'icon',
              type: 'text',
              label: {
                en: 'Icon',
                ru: 'Иконка',
              },
              admin: {
                description: 'Lucide icon name',
              },
            },
          ],
          minRows: 1,
          maxRows: 6,
        },
      ],
    },
    // Founder Section
    {
      name: 'founder',
      type: 'group',
      label: {
        en: 'Founder Section',
        ru: 'Секция "Основатель"',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: {
            en: 'Title',
            ru: 'Заголовок',
          },
          localized: true,
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          label: {
            en: 'Name',
            ru: 'Имя',
          },
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          label: {
            en: 'Role',
            ru: 'Должность',
          },
          localized: true,
          required: true,
        },
        {
          name: 'bio',
          type: 'richText',
          label: {
            en: 'Biography',
            ru: 'Биография',
          },
          localized: true,
          editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [
                ...rootFeatures,
                HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
                FixedToolbarFeature(),
                InlineToolbarFeature(),
              ]
            },
          }),
        },
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          label: {
            en: 'Photo',
            ru: 'Фотография',
          },
        },
        {
          name: 'socialLinks',
          type: 'group',
          label: {
            en: 'Social Links',
            ru: 'Социальные ссылки',
          },
          fields: [
            {
              name: 'linkedin',
              type: 'text',
              label: 'LinkedIn',
            },
            {
              name: 'telegram',
              type: 'text',
              label: 'Telegram',
            },
            {
              name: 'email',
              type: 'email',
              label: 'Email',
            },
            {
              name: 'website',
              type: 'text',
              label: {
                en: 'Website',
                ru: 'Веб-сайт',
              },
            },
          ],
        },
      ],
    },
    // Values Section
    {
      name: 'values',
      type: 'group',
      label: {
        en: 'Values Section',
        ru: 'Секция "Ценности"',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: {
            en: 'Title',
            ru: 'Заголовок',
          },
          localized: true,
          required: true,
        },
        {
          name: 'subtitle',
          type: 'text',
          label: {
            en: 'Subtitle',
            ru: 'Подзаголовок',
          },
          localized: true,
        },
        {
          name: 'items',
          type: 'array',
          label: {
            en: 'Values',
            ru: 'Ценности',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: {
                en: 'Title',
                ru: 'Заголовок',
              },
              localized: true,
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: {
                en: 'Description',
                ru: 'Описание',
              },
              localized: true,
              required: true,
            },
            {
              name: 'icon',
              type: 'text',
              label: {
                en: 'Icon',
                ru: 'Иконка',
              },
              admin: {
                description: 'Lucide icon name',
              },
            },
          ],
          minRows: 1,
          maxRows: 8,
        },
      ],
    },
    // Approach Section
    {
      name: 'approach',
      type: 'group',
      label: {
        en: 'Approach Section',
        ru: 'Секция "Подход"',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: {
            en: 'Title',
            ru: 'Заголовок',
          },
          localized: true,
          required: true,
        },
        {
          name: 'subtitle',
          type: 'text',
          label: {
            en: 'Subtitle',
            ru: 'Подзаголовок',
          },
          localized: true,
        },
        {
          name: 'steps',
          type: 'array',
          label: {
            en: 'Steps',
            ru: 'Шаги',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: {
                en: 'Title',
                ru: 'Заголовок',
              },
              localized: true,
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: {
                en: 'Description',
                ru: 'Описание',
              },
              localized: true,
              required: true,
            },
            {
              name: 'icon',
              type: 'text',
              label: {
                en: 'Icon',
                ru: 'Иконка',
              },
              admin: {
                description: 'Lucide icon name',
              },
            },
          ],
          minRows: 1,
          maxRows: 6,
        },
      ],
    },
    // CTA Section
    {
      name: 'cta',
      type: 'group',
      label: {
        en: 'Call to Action Section',
        ru: 'Секция "Призыв к действию"',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: {
            en: 'Title',
            ru: 'Заголовок',
          },
          localized: true,
          required: true,
        },
        {
          name: 'subtitle',
          type: 'text',
          label: {
            en: 'Subtitle',
            ru: 'Подзаголовок',
          },
          localized: true,
        },
        {
          name: 'primaryButton',
          type: 'group',
          label: {
            en: 'Primary Button',
            ru: 'Основная кнопка',
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              label: {
                en: 'Button Text',
                ru: 'Текст кнопки',
              },
              localized: true,
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              label: 'URL',
              required: true,
            },
          ],
        },
        {
          name: 'secondaryButton',
          type: 'group',
          label: {
            en: 'Secondary Button',
            ru: 'Вторичная кнопка',
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              label: {
                en: 'Button Text',
                ru: 'Текст кнопки',
              },
              localized: true,
            },
            {
              name: 'url',
              type: 'text',
              label: 'URL',
            },
          ],
        },
      ],
    },
    // SEO
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: {
            en: 'Meta Title',
            ru: 'Мета заголовок',
          },
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: {
            en: 'Meta Description',
            ru: 'Мета описание',
          },
          localized: true,
        },
        {
          name: 'keywords',
          type: 'text',
          label: {
            en: 'Keywords',
            ru: 'Ключевые слова',
          },
          localized: true,
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: {
            en: 'Open Graph Image',
            ru: 'Изображение для соцсетей',
          },
        },
      ],
    },
  ],
}

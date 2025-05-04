import type { CollectionConfig, Field } from 'payload'
import { slugField } from '@/fields/slug'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { availableBlocks } from '../../blocks'

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    group: 'Управление Обучением', // Translated group name
    useAsTitle: 'title',
    listSearchableFields: ['title'],
    defaultColumns: ['title', 'author', 'status', 'updatedAt'],
    description: 'Коллекция для учебных курсов платформы.',
  },
  versions: {
    drafts: true,
  },
  labels: {
    singular: 'Курс',
    plural: 'Курсы',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название курса',
      required: true,
      localized: true,
    },
    ...slugField(),
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Опубликован', value: 'published' },
        { label: 'Архив', value: 'archived' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'instructors', // Renamed from 'author'
      type: 'relationship',
      relationTo: 'users',
      label: 'Инструкторы', // Updated label
      required: true,
      hasMany: true, // Added hasMany
      filterOptions: { // Moved filterOptions to top level
        roles: { contains: 'instructor' },
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Обложка курса',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Краткое описание (для карточек)',
      localized: true,
    },
    {
      name: 'learningObjectives',
      type: 'richText',
      label: 'Чему вы научитесь',
      localized: true,
      editor: lexicalEditor({}), // Assuming lexical editor is configured
    },
    {
      name: 'liveSessions',
      type: 'array',
      label: 'Живые сессии / Вебинары',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Название сессии',
          required: true,
        },
        {
          name: 'dateTime',
          type: 'date',
          label: 'Дата и время',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'durationMinutes',
          type: 'number',
          label: 'Длительность (минуты)',
          min: 15,
        },
        {
          name: 'meetingLink',
          type: 'text', // Changed from 'url' to 'text'
          label: 'Ссылка на встречу (Zoom, Google Meet и т.д.)',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Краткое описание сессии',
        },
      ],
    },
    {
      name: 'difficulty',
      type: 'select',
      label: 'Уровень сложности',
      options: [
        { label: 'Начинающий', value: 'beginner' },
        { label: 'Средний', value: 'intermediate' },
        { label: 'Продвинутый', value: 'advanced' },
      ],
      admin: {
        position: 'sidebar' as const, // Explicitly type as literal 'sidebar'
      },
    },
    {
      name: 'estimatedDuration',
      type: 'text',
      label: 'Примерная длительность (текст)',
      admin: {
        description: "Например, '10 часов', '3 недели'.",
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Теги/Категории',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'prerequisites',
      type: 'relationship',
      relationTo: 'courses',
      hasMany: true,
      label: 'Предварительные курсы',
      admin: {
        description: 'Курсы, которые необходимо пройти перед началом этого.',
        position: 'sidebar',
      },
    },
{
      name: 'subtitle',
      type: 'text',
      label: 'Подзаголовок',
      localized: true,
    },
    {
      name: 'modules',
      type: 'relationship',
      relationTo: 'modules',
      hasMany: true,
      label: 'Модули курса',
    },
    {
      name: 'courseDescription',
      type: 'richText',
      label: 'Основное описание курса',
      localized: true,
      editor: lexicalEditor({}),
    },
    {
      name: 'courseFormat',
      type: 'select',
      label: 'Формат курса',
      options: ['Online Self-paced', 'Online Cohort-based', 'Hybrid', 'In-person'],
    },
    {
      name: 'enrollmentStartDate',
      type: 'date',
      label: 'Дата начала записи',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'enrollmentEndDate',
      type: 'date',
      label: 'Дата окончания записи',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'courseStartDate',
      type: 'date',
      label: 'Дата начала курса',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly', // Assuming only date is needed, not time
          displayFormat: 'dd.MM.yyyy',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'bookingStatus',
      type: 'select',
      label: 'Статус бронирования',
      options: [
        { label: 'Еще не открыто', value: 'not_yet_open' },
        { label: 'Открыто', value: 'open' },
        { label: 'Закрыто (до начала)', value: 'closed' },
        { label: 'В процессе', value: 'in_progress' },
        { label: 'Завершено', value: 'completed' },
      ],
      defaultValue: 'not_yet_open',
      admin: {
        position: 'sidebar',
        readOnly: true, // Status should be updated by the endpoint, not manually
        description: 'Обновляется автоматически.',
      },
    },
    {
      name: 'averageRating',
      type: 'number',
      label: 'Средний рейтинг',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'totalReviews',
      type: 'number',
      label: 'Всего отзывов',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    // Section: Target Audience
    {
      name: 'targetAudienceTitle',
      type: 'text',
      label: 'Целевая аудитория (Заголовок)', // Placeholder Label
      localized: true,
    },
    {
      name: 'targetAudienceDescription',
      type: 'richText',
      label: 'Описание целевой аудитории', // Placeholder Label
      localized: true,
      editor: lexicalEditor({}),
    },

    // Section: Community Support
    {
      name: 'communitySupportTitle',
      type: 'text',
      label: 'Поддержка сообщества (Заголовок)', // Placeholder Label
      localized: true,
    },
    {
      name: 'communitySupportDescription',
      type: 'richText',
      label: 'Описание поддержки сообщества', // Placeholder Label
      localized: true,
      editor: lexicalEditor({}),
    },
    {
      name: 'communitySupportLinks',
      type: 'array',
      label: 'Ссылки сообщества', // Placeholder Label
      localized: true,
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Текст ссылки', // Placeholder Label
          required: true,
        },
        {
          name: 'url',
          type: 'text', // Using text for flexibility (e.g., mailto:, discord://)
          label: 'URL',
          required: true,
        },
      ],
    },

    // Section: FAQ
    {
      name: 'faqTitle',
      type: 'text',
      label: 'FAQ (Заголовок)', // Placeholder Label
      localized: true,
    },
    {
      name: 'faqs',
      type: 'array',
      label: 'Часто задаваемые вопросы (FAQ)', // Placeholder Label
      localized: true,
      fields: [
        {
          name: 'question',
          type: 'text',
          label: 'Вопрос', // Placeholder Label
          required: true,
        },
        {
          name: 'answer',
          type: 'richText',
          label: 'Ответ', // Placeholder Label
          required: true,
          editor: lexicalEditor({}),
        },
      ],
    },

    // Section: Certificate Info
    {
      name: 'certificateTitle',
      type: 'text',
      label: 'Информация о сертификате (Заголовок)', // Placeholder Label
      localized: true,
    },
    {
      name: 'offersCertificate',
      type: 'checkbox',
      label: 'Предлагается сертификат?', // Placeholder Label
      defaultValue: false,
    },
    {
      name: 'certificateDescription',
      type: 'richText',
      label: 'Описание сертификата', // Placeholder Label
      localized: true,
      editor: lexicalEditor({}),
      admin: {
        condition: (data) => data?.offersCertificate === true,
      },
    },
    {
      name: 'certificatePreview',
      type: 'relationship',
      relationTo: 'media',
      label: 'Предпросмотр сертификата', // Placeholder Label
      admin: {
        condition: (data) => data?.offersCertificate === true,
      },
    },

    // Section: Related Courses
    {
      name: 'relatedCoursesTitle',
      type: 'text',
      label: 'Связанные курсы (Заголовок)', // Placeholder Label
      localized: true,
    },
    {
      name: 'relatedCourses',
      type: 'relationship',
      relationTo: 'courses',
      hasMany: true,
      label: 'Связанные курсы', // Placeholder Label
      filterOptions: ({ id }) => { // Prevent relating a course to itself
        if (id) {
          return {
            id: { not_equals: id },
          }
        }
        return true // Return true to include all options when no ID
      },
    },

    // Existing SEO Section starts here
    {
      name: 'seo',
      type: 'group',
      label: 'SEO Настройки',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta Заголовок (Title)', // Translated label
          localized: true,
          admin: {
            description: 'Оптимальная длина 50-60 символов.',
          },
        } as Field, // Add type assertion
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Meta Описание (Description)', // Translated label
          localized: true,
          admin: {
            description: 'Оптимальная длина 150-160 символов.',
          },
        } as Field, // Add type assertion
        // Можно добавить metaImage, keywords и т.д. при необходимости
      ],
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: 'Связанный продукт',
      admin: {
        description: 'Продукт, который нужно купить для доступа к курсу',
        position: 'sidebar',
      },
    },
    {
      name: 'accessType',
      type: 'select',
      label: 'Тип доступа',
      options: [
        { label: 'Платный', value: 'paid' },
        { label: 'Бесплатный', value: 'free' },
        { label: 'По подписке', value: 'subscription' },
      ],
      defaultValue: 'paid',
      admin: {
        position: 'sidebar',
        description: 'Как пользователи получают доступ к курсу',
      },
    },
    {
      name: 'accessDuration',
      type: 'group',
      label: 'Длительность доступа',
      admin: {
        description: 'Как долго пользователи имеют доступ к курсу после покупки',
        condition: (data) => data?.accessType === 'paid',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Неограниченный', value: 'unlimited' },
            { label: 'Ограниченный период', value: 'limited' },
          ],
          defaultValue: 'unlimited',
        },
        {
          name: 'duration',
          type: 'number',
          admin: {
            description: 'Количество единиц времени',
            condition: (data) => data?.type === 'limited',
          },
        },
        {
          name: 'unit',
          type: 'select',
          options: [
            { label: 'Дни', value: 'days' },
            { label: 'Недели', value: 'weeks' },
            { label: 'Месяцы', value: 'months' },
            { label: 'Годы', value: 'years' },
          ],
          defaultValue: 'months',
          admin: {
            condition: (data) => data?.type === 'limited',
          },
        },
      ],
    },
    {
      name: 'enrollmentCapacity',
      type: 'number',
      label: 'Лимит мест',
      min: 0,
      admin: {
        description: 'Максимальное количество студентов. Оставьте 0 или пустым для неограниченного.',
        position: 'sidebar',
        step: 1,
      },
    },
    // NEW: Optional relationship to a final assessment for the course
    { // Uncommented field
      name: 'finalAssessment',
      type: 'relationship',
      relationTo: 'assessments',
      label: 'Итоговая оценка',
      required: false,
      admin: {
        description: 'Необязательная итоговая оценка для завершения курса.',
        position: 'sidebar',
      },
    },
    {
      name: 'discussionForum',
      type: 'relationship',
      relationTo: 'forum-categories', // Corrected slug
      label: 'Связанный форум',
      admin: {
        description: 'Выберите категорию форума для этого курса.',
        position: 'sidebar',
      },
    },
  ],
}

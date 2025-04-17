import { CollectionConfig } from 'payload/types'
import { isAdmin, isAdminOrEditor } from '../access/isAdmin'

const CourseAnalytics: CollectionConfig = {
  slug: 'course-analytics',
  admin: {
    useAsTitle: 'courseTitle',
    defaultColumns: ['courseTitle', 'views', 'completionRate', 'createdAt'],
    group: 'Analytics',
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      hasMany: false,
      admin: {
        condition: () => false, // Скрываем это поле в админке, используем courseTitle
      },
    },
    {
      name: 'courseTitle',
      type: 'text',
      required: true,
      label: 'Название курса',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'views',
      type: 'number',
      required: true,
      defaultValue: 0,
      label: 'Просмотры',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'enrollments',
      type: 'number',
      required: true,
      defaultValue: 0,
      label: 'Записи на курс',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'completions',
      type: 'number',
      required: true,
      defaultValue: 0,
      label: 'Завершения курса',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'completionRate',
      type: 'number',
      required: true,
      defaultValue: 0,
      label: 'Процент завершения',
      admin: {
        readOnly: true,
        description: 'Процент пользователей, завершивших курс от общего числа записавшихся',
      },
    },
    {
      name: 'averageRating',
      type: 'number',
      required: true,
      defaultValue: 0,
      label: 'Средняя оценка',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'totalRevenue',
      type: 'number',
      required: true,
      defaultValue: 0,
      label: 'Общий доход',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'moduleCompletionRates',
      type: 'array',
      label: 'Статистика по модулям',
      fields: [
        {
          name: 'moduleId',
          type: 'text',
          required: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'moduleTitle',
          type: 'text',
          required: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'completionRate',
          type: 'number',
          required: true,
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'lessonCompletionRates',
      type: 'array',
      label: 'Статистика по урокам',
      fields: [
        {
          name: 'lessonId',
          type: 'text',
          required: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'lessonTitle',
          type: 'text',
          required: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'moduleTitle',
          type: 'text',
          required: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'completionRate',
          type: 'number',
          required: true,
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'averageTimeSpent',
          type: 'number',
          required: true,
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Среднее время, проведенное на уроке (в минутах)',
          },
        },
      ],
    },
    {
      name: 'conversionRates',
      type: 'group',
      label: 'Конверсии',
      fields: [
        {
          name: 'landingToEnrollment',
          type: 'number',
          required: true,
          defaultValue: 0,
          label: 'Лендинг → Запись',
          admin: {
            readOnly: true,
            description: 'Процент посетителей лендинга, записавшихся на курс',
          },
        },
        {
          name: 'enrollmentToStart',
          type: 'number',
          required: true,
          defaultValue: 0,
          label: 'Запись → Начало',
          admin: {
            readOnly: true,
            description: 'Процент записавшихся, начавших обучение',
          },
        },
        {
          name: 'startToCompletion',
          type: 'number',
          required: true,
          defaultValue: 0,
          label: 'Начало → Завершение',
          admin: {
            readOnly: true,
            description: 'Процент начавших обучение, завершивших курс',
          },
        },
      ],
    },
    {
      name: 'timeDistribution',
      type: 'array',
      label: 'Распределение по времени',
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          admin: {
            readOnly: true,
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'views',
          type: 'number',
          required: true,
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'enrollments',
          type: 'number',
          required: true,
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'completions',
          type: 'number',
          required: true,
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'revenue',
          type: 'number',
          required: true,
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
  ],
  timestamps: true,
}

export default CourseAnalytics

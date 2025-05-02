import type { CollectionConfig, Validate } from 'payload' // Import Validate
import { slugField } from '@/fields/slug'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { availableBlocks } from '../../blocks' // Import available blocks
import { filterAvailableLessons } from './hooks/filterAvailableLessons' // Import the hook

// Define interface for drip content data shape
interface DripContentData {
  dripType?: 'immediate' | 'daysAfterEnrollment' | 'specificDate';
  dripDelayDays?: number | null;
  releaseDate?: Date | null; // Changed from string to Date
}

// Typed validate functions
const validateDripDelayDays: Validate<number | null | undefined, unknown, DripContentData> = (value, { siblingData }) => {
  if (siblingData?.dripType === 'daysAfterEnrollment' && (value === null || value === undefined || value < 0)) {
    return 'Пожалуйста, укажите неотрицательное количество дней задержки.';
  }
  return true;
};

// Updated validate function signature to expect Date
const validateReleaseDate: Validate<Date | null | undefined, unknown, DripContentData> = (value, { siblingData }) => {
  if (siblingData?.dripType === 'specificDate' && !value) {
    return 'Пожалуйста, укажите дату выпуска.';
  }
  return true;
};

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    group: 'Learning Management',
    useAsTitle: 'title',
    listSearchableFields: ['title'],
    defaultColumns: ['title', 'module', 'order', 'type', 'updatedAt'],
    description: 'Коллекция для уроков внутри модулей курсов.',
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeRead: [filterAvailableLessons],
  },
  labels: {
    singular: 'Урок',
    plural: 'Уроки',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название урока',
      required: true,
      localized: true,
    },
    ...slugField('title', { slugOverrides: { admin: { readOnly: true } } }),
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Опубликован', value: 'published' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'dripContent',
      type: 'group',
      label: 'Настройки Drip Content',
      admin: {
        position: 'sidebar',
        description: 'Когда этот урок станет доступен студентам.',
      },
      fields: [
        {
          name: 'dripType',
          type: 'select',
          label: 'Тип выпуска',
          options: [
            { label: 'Сразу', value: 'immediate' },
            { label: 'Через N дней после зачисления', value: 'daysAfterEnrollment' },
            { label: 'В конкретную дату', value: 'specificDate' },
          ],
          defaultValue: 'immediate',
          required: true,
        },
        {
          name: 'dripDelayDays',
          type: 'number',
          label: 'Задержка (дни)',
          min: 0,
          admin: {
            condition: (_, siblingData) => siblingData?.dripType === 'daysAfterEnrollment',
            step: 1,
          },
          required: true, // Required if type is daysAfterEnrollment
          validate: validateDripDelayDays, // Use typed validate function
        },
        {
          name: 'releaseDate',
          type: 'date',
          label: 'Дата выпуска',
          admin: {
            condition: (_, siblingData) => siblingData?.dripType === 'specificDate',
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
          required: true, // Required if type is specificDate
          validate: validateReleaseDate, // Use typed validate function
        },
      ],
    },
    {
      name: 'module',
      type: 'relationship',
      relationTo: 'modules' as const, // Add 'as const'
      label: 'Модуль',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Краткое описание',
      localized: true,
    },
    // NEW: Replaced content/videoUrl with flexible blocks
    {
      name: 'layout',
      label: 'Содержимое урока',
      type: 'blocks',
      minRows: 1,
      blocks: availableBlocks, // Use imported blocks
      required: true,
      localized: true,
    },
    {
      name: 'type',
      type: 'select',
      label: 'Тип урока',
      options: [
        { label: 'Видео', value: 'video' },
        { label: 'Текст', value: 'text' },
        { label: 'Тест', value: 'quiz' },
        { label: 'Задание', value: 'assignment' },
      ],
      defaultValue: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'duration',
      type: 'text',
      label: 'Длительность',
      admin: {
        description: 'Например: "30 минут" или "1 час"',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Порядок',
      admin: {
        description: 'Порядковый номер урока в модуле',
        position: 'sidebar',
      },
    },
    // NEW: Conditional relationship to Assessments
    { // Uncommented
      name: 'assessment',
      type: 'relationship',
      relationTo: 'assessments', // This collection will be created later
      label: 'Оценка (Тест/Задание)',
      required: false,
      admin: {
        description: 'Связанная оценка, если тип урока "Тест" или "Задание".',
        position: 'sidebar',
        condition: (data) => data.type === 'quiz' || data.type === 'assignment',
      },
    },
     // Uncommented
    // NEW: Optional prerequisites (other lessons)
    {
      name: 'prerequisites',
      type: 'relationship',
      relationTo: 'lessons',
      hasMany: true,
      label: 'Предварительные уроки',
      required: false,
      admin: {
        description: 'Уроки, которые должны быть завершены перед началом этого.',
      },
    },
    // NEW: Completion criteria
    {
      name: 'completionCriteria',
      type: 'select',
      label: 'Критерий завершения',
      options: [
        { label: 'Просмотрен', value: 'viewed' },
        { label: 'Пройдена оценка', value: 'pass_assessment' },
      ],
      defaultValue: 'viewed',
      required: true,
      admin: {
        description: 'Как определяется, что урок завершен.',
        position: 'sidebar',
      },
    },
    {
      name: 'attachments',
      type: 'array',
      label: 'Вложения',
      admin: {
        description: 'Файлы, прикрепленные к уроку',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Название',
          required: true,
        },
        {
          name: 'file',
          type: 'upload',
          label: 'Файл',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}

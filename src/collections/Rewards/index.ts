import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Rewards: CollectionConfig = {
  slug: 'rewards',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'requiredLevel', 'status'],
    group: 'Learning Management',
    description: 'Rewards for achievements and level milestones',
  },
  access: {
    create: isAdmin,
    read: () => true, // Все могут видеть доступные награды
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Название награды',
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({}),
      required: true,
      admin: {
        description: 'Описание награды',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Уровень', value: 'level' },
        { label: 'Достижение', value: 'achievement' },
        { label: 'Курс', value: 'course' },
        { label: 'Особое', value: 'special' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Тип награды',
      },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Иконка награды',
      },
    },
    {
      name: 'requiredLevel',
      type: 'number',
      min: 1,
      admin: {
        description: 'Требуемый уровень для получения награды (для наград типа "Уровень")',
        condition: (data) => data.type === 'level',
      },
    },
    {
      name: 'requiredAchievement',
      type: 'relationship',
      relationTo: 'achievements',
      admin: {
        description: 'Требуемое достижение для получения награды (для наград типа "Достижение")',
        condition: (data) => data.type === 'achievement',
      },
    },
    {
      name: 'requiredCourse',
      type: 'relationship',
      relationTo: 'courses',
      admin: {
        description: 'Требуемый курс для получения награды (для наград типа "Курс")',
        condition: (data) => data.type === 'course',
      },
    },
    {
      name: 'rewardType',
      type: 'select',
      required: true,
      options: [
        { label: 'Скидка', value: 'discount' },
        { label: 'Бесплатный курс', value: 'free_course' },
        { label: 'Бейдж', value: 'badge' },
        { label: 'Сертификат', value: 'certificate' },
        { label: 'Доступ к эксклюзивному контенту', value: 'exclusive_content' },
        { label: 'Другое', value: 'other' },
      ],
      admin: {
        description: 'Тип вознаграждения',
      },
    },
    {
      name: 'discountValue',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description: 'Размер скидки в процентах (для наград типа "Скидка")',
        condition: (data) => data.rewardType === 'discount',
      },
    },
    {
      name: 'freeCourse',
      type: 'relationship',
      relationTo: 'courses',
      admin: {
        description: 'Бесплатный курс (для наград типа "Бесплатный курс")',
        condition: (data) => data.rewardType === 'free_course',
      },
    },
    {
      name: 'exclusiveContent',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        description: 'Эксклюзивный контент (для наград типа "Доступ к эксклюзивному контенту")',
        condition: (data) => data.rewardType === 'exclusive_content',
      },
    },
    {
      name: 'expiresAfter',
      type: 'number',
      min: 0,
      admin: {
        description: 'Срок действия награды в днях (0 = бессрочно)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Активна', value: 'active' },
        { label: 'Неактивна', value: 'inactive' },
        { label: 'Черновик', value: 'draft' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Статус награды',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Дополнительные метаданные для награды',
      },
    },
  ],
  timestamps: true,
}

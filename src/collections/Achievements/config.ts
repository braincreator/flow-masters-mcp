import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { isAdmin } from '@/access/isAdmin'

export const Achievements: CollectionConfig = {
  slug: 'achievements',
  admin: {
    useAsTitle: 'title',
    description: 'Коллекция для хранения достижений/бейджей платформы.',
    defaultColumns: ['title', 'category', 'triggerEvent', 'xpValue', 'status'],
    group: 'Learning Management',
  },
  labels: {
    singular: 'Достижение',
    plural: 'Достижения',
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название достижения',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание (как получить)',
      editor: lexicalEditor({}),
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      label: 'Категория',
      required: true,
      options: [
        { label: 'Завершение курса', value: 'course_completion' },
        { label: 'Учебные достижения', value: 'learning_milestones' },
        { label: 'Вовлеченность', value: 'engagement' },
        { label: 'Социальная активность', value: 'social' },
        { label: 'Особые', value: 'special' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Иконка достижения',
      required: true,
    },
    {
      name: 'triggerEvent',
      type: 'select',
      label: 'Событие-триггер',
      required: true,
      options: [
        { label: 'Курс начат', value: 'course.started' },
        { label: 'Курс завершен', value: 'course.completed' },
        { label: 'Прогресс по курсу', value: 'course.progress' },
        { label: 'Урок завершен', value: 'lesson.completed' },
        { label: 'Тест пройден', value: 'quiz.completed' },
        { label: 'Задание выполнено', value: 'assignment.completed' },
        { label: 'Серия дней', value: 'streak.achieved' },
        { label: 'Количество входов', value: 'login.count' },
        { label: 'Профиль заполнен', value: 'profile.completed' },
        { label: 'Комментарий добавлен', value: 'comment.added' },
        { label: 'Контент поделились', value: 'content.shared' },
        { label: 'Реферал привлечен', value: 'referral.completed' },
      ],
    },
    {
      name: 'courseId',
      type: 'relationship',
      relationTo: 'courses',
      label: 'Связанный курс',
      admin: {
        condition: (data) =>
          ['course.started', 'course.completed', 'course.progress'].includes(data?.triggerEvent),
        description: 'Конкретный курс, к которому привязано достижение (если применимо)',
      },
    },
    {
      name: 'requiredValue',
      type: 'number',
      label: 'Требуемое значение',
      admin: {
        description:
          'Требуемое значение для получения достижения (например, процент прогресса, дни серии)',
      },
    },
    {
      name: 'xpValue',
      type: 'number',
      label: 'Очки опыта (XP)',
      defaultValue: 10,
      required: true,
      min: 0,
    },
    {
      name: 'rarity',
      type: 'select',
      label: 'Редкость',
      options: [
        { label: 'Обычное', value: 'common' },
        { label: 'Необычное', value: 'uncommon' },
        { label: 'Редкое', value: 'rare' },
        { label: 'Эпическое', value: 'epic' },
        { label: 'Легендарное', value: 'legendary' },
      ],
      defaultValue: 'common',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Активно', value: 'active' },
        { label: 'Неактивно', value: 'inactive' },
        { label: 'Скрыто', value: 'hidden' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}

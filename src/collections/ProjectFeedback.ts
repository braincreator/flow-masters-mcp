import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrAssignedUser } from '@/access/isAdminOrAssignedUser'

const ProjectFeedback: CollectionConfig = {
  slug: 'project-feedback',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'project', 'rating', 'createdAt'],
    group: 'E-commerce',
  },
  access: {
    create: isAdminOrAssignedUser,
    read: isAdminOrAssignedUser,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Заголовок отзыва',
      },
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'service-projects',
      required: true,
      admin: {
        description: 'Проект',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Автор отзыва',
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      required: true,
      admin: {
        description: 'Оценка (от 1 до 5)',
      },
    },
    {
      name: 'comment',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Текст отзыва',
      },
    },
    {
      name: 'feedbackType',
      type: 'select',
      options: [
        { label: 'Общий отзыв', value: 'general' },
        { label: 'Этап проекта', value: 'milestone' },
        { label: 'Отзыв о сотрудничестве', value: 'collaboration' },
        { label: 'Отзыв о результате', value: 'result' },
      ],
      defaultValue: 'general',
      required: true,
      admin: {
        description: 'Тип отзыва',
      },
    },
    {
      name: 'milestone',
      type: 'relationship',
      relationTo: 'project-milestones',
      admin: {
        description: 'Связанный этап проекта (если применимо)',
        condition: (data) => data?.feedbackType === 'milestone',
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Показывать отзыв публично',
      },
    },
  ],
  timestamps: true,
}

export default ProjectFeedback

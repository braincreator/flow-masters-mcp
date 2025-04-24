import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'

export const LessonProgress: CollectionConfig = {
  slug: 'lesson-progress',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'lesson', 'course', 'status', 'completedAt'],
    group: 'Learning Management',
    description: 'Tracking user progress through lessons',
  },
  access: {
    create: isAdminOrSelf,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'User who viewed the lesson',
      },
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      required: true,
      admin: {
        description: 'The lesson that was viewed',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: {
        description: 'The course the lesson belongs to',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'in_progress',
      options: [
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Current status of the lesson progress',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the lesson was completed',
        condition: (data) => data.status === 'completed',
      },
    },
    {
      name: 'lastAccessedAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the lesson was last accessed',
      },
    },
    {
      name: 'timeSpent',
      type: 'number',
      min: 0,
      admin: {
        description: 'Time spent on the lesson in seconds',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for the lesson progress',
      },
    },
  ],
  timestamps: true,
}

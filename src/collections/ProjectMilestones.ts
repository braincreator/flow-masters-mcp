import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

const ProjectMilestones: CollectionConfig = {
  slug: 'project-milestones',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'project', 'dueDate', 'status', 'updatedAt'],
    group: 'E-commerce',
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Название этапа проекта',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Описание этапа',
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
      name: 'startDate',
      type: 'date',
      admin: {
        description: 'Дата начала',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'dueDate',
      type: 'date',
      admin: {
        description: 'Плановая дата завершения',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'completionDate',
      type: 'date',
      admin: {
        description: 'Фактическая дата завершения',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        condition: (data) => data?.status === 'completed',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Не начат', value: 'not_started' },
        { label: 'В процессе', value: 'in_progress' },
        { label: 'Завершен', value: 'completed' },
        { label: 'Просрочен', value: 'overdue' },
      ],
      defaultValue: 'not_started',
      required: true,
      admin: {
        description: 'Статус этапа',
      },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Низкий', value: 'low' },
        { label: 'Средний', value: 'medium' },
        { label: 'Высокий', value: 'high' },
        { label: 'Критический', value: 'critical' },
      ],
      defaultValue: 'medium',
      admin: {
        description: 'Приоритет этапа',
      },
    },
    {
      name: 'progress',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
      admin: {
        description: 'Прогресс выполнения (0-100%)',
      },
    },
    {
      name: 'dependencies',
      type: 'relationship',
      relationTo: 'project-milestones',
      hasMany: true,
      admin: {
        description: 'Зависимости (этапы, которые должны быть завершены до начала этого этапа)',
      },
    },
    {
      name: 'associatedTasks',
      type: 'relationship',
      relationTo: 'tasks',
      hasMany: true,
      admin: {
        description: 'Связанные задачи',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Порядок сортировки этапов',
      },
    },
  ],
  timestamps: true,
}

export default ProjectMilestones

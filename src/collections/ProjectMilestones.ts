import { CollectionConfig, Access } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { serviceProjectHooks } from '@/hooks/collections/serviceProjects'

// Функция доступа для проверки является ли пользователь заказчиком проекта или администратором
const isAdminOrProjectCustomer: Access = ({ req: { user } }) => {
  if (!user) return false

  // Администраторы имеют полный доступ
  if (user.roles?.includes('admin')) return true

  // Для запросов на создание/обновление/удаление доступ имеют только заказчики к своим проектам
  return {
    'project.customer': {
      equals: user.id,
    },
  }
}

const ProjectMilestones: CollectionConfig = {
  slug: 'project-milestones',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'project', 'dueDate', 'status', 'completedAt'],
    group: 'E-commerce',
  },
  access: {
    create: isAdmin,
    read: isAdminOrProjectCustomer,
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
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Порядковый номер этапа',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Запланирован', value: 'planned' },
        { label: 'В работе', value: 'in_progress' },
        { label: 'Завершен', value: 'completed' },
        { label: 'Отложен', value: 'delayed' },
      ],
      defaultValue: 'planned',
      required: true,
      admin: {
        description: 'Статус этапа',
      },
    },
    {
      name: 'dueDate',
      type: 'date',
      admin: {
        description: 'Планируемая дата завершения',
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: '24hr',
        },
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        description: 'Фактическая дата завершения',
        date: {
          pickerAppearance: 'dayAndTime',
          timeFormat: '24hr',
        },
        condition: (data) => data.status === 'completed',
      },
    },
    {
      name: 'deliverables',
      type: 'array',
      admin: {
        description: 'Результаты этапа',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'Название результата',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Описание результата',
          },
        },
        {
          name: 'files',
          type: 'relationship',
          relationTo: 'media',
          hasMany: true,
          admin: {
            description: 'Файлы результата',
          },
        },
      ],
    },
    {
      name: 'clientApprovalRequired',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Требуется подтверждение клиента',
      },
    },
    {
      name: 'clientApproved',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Подтверждено клиентом',
        condition: (data) => data.clientApprovalRequired === true && data.status === 'completed',
      },
    },
    {
      name: 'clientFeedback',
      type: 'textarea',
      admin: {
        description: 'Отзыв клиента',
        condition: (data) => data.clientApprovalRequired === true && data.status === 'completed',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // Если статус этапа изменился на "Завершен", отправляем уведомление клиенту
        if (operation === 'update' && doc.status === 'completed' && !doc.completedAt) {
          try {
            const { payload } = req
            
            // Получаем проект
            const project = await payload.findByID({
              collection: 'service-projects',
              id: typeof doc.project === 'object' ? doc.project.id : doc.project,
              depth: 1,
            })
            
            // Обновляем дату завершения этапа
            await payload.update({
              collection: 'project-milestones',
              id: doc.id,
              data: {
                completedAt: new Date().toISOString(),
              },
            })
            
            // Создаем системное сообщение о завершении этапа
            await payload.create({
              collection: 'project-messages',
              data: {
                project: typeof doc.project === 'object' ? doc.project.id : doc.project,
                author: req.user.id,
                isSystemMessage: true,
                content: `Milestone "${doc.title}" has been completed.`,
              },
            })
          } catch (error) {
            req.payload.logger.error(`Error processing milestone completion: ${error}`)
          }
        }
      },
    ],
  },
  timestamps: true,
}

export default ProjectMilestones

import { CollectionConfig, Access } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { ServiceRegistry } from '@/services/service.registry'

// Функция доступа для проверки является ли пользователь заказчиком проекта задачи или администратором
const isAdminOrProjectCustomer: Access = async ({ req, id, data }) => {
  const { user, payload } = req

  if (!user) return false

  // Администраторы имеют полный доступ
  if (user.roles?.includes('admin')) return true

  let projectId

  // Для обновления или удаления получаем проект из существующей задачи
  if (id) {
    try {
      const task = await payload.findByID({
        collection: 'tasks',
        id: String(id),
      })

      projectId = task.project
    } catch (error) {
      return false
    }
  } else if (data?.project) {
    // Для создания получаем проект из переданных данных
    projectId = data.project
  } else {
    return false
  }

  // Проверяем, является ли пользователь заказчиком проекта
  try {
    const project = await payload.findByID({
      collection: 'service-projects',
      id: projectId,
    })

    return project.customer === user.id
  } catch (error) {
    return false
  }
}

const Tasks: CollectionConfig = {
  slug: 'tasks',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'project', 'status', 'assignedTo', 'createdAt'],
    group: 'E-commerce',
  },
  access: {
    create: isAdmin,
    read: isAdminOrProjectCustomer,
    update: isAdminOrProjectCustomer,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'service-projects',
      required: true,
      admin: {
        description: 'Связанный проект по услуге',
        readOnly: false,
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Название задачи',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Описание задачи',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'To Do', value: 'todo' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Review', value: 'review' },
        { label: 'Completed', value: 'completed' },
      ],
      defaultValue: 'todo',
      required: true,
      admin: {
        description: 'Task status',
      },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      defaultValue: 'medium',
      admin: {
        description: 'Task priority',
      },
    },
    {
      name: 'progress',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
      admin: {
        description: 'Task completion progress (0-100%)',
      },
    },
    {
      name: 'dueDate',
      type: 'date',
      admin: {
        description: 'Плановая дата завершения задачи',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        description: 'Actual completion date',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        condition: (data) => data?.status === 'completed',
      },
    },
    {
      name: 'estimatedHours',
      type: 'number',
      min: 0,
      admin: {
        description: 'Estimated hours to complete',
      },
    },
    {
      name: 'actualHours',
      type: 'number',
      min: 0,
      admin: {
        description: 'Actual hours spent',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
      admin: {
        description: 'Task tags',
      },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Ответственный',
      },
    },
  ],
  hooks: {
    afterChange: [
      // Добавляем хук для событий задач
      async ({ doc, previousDoc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Событие создания задачи
          await eventService.publishEvent('task.created', {
            id: doc.id,
            title: doc.title,
            description: doc.description,
            project: typeof doc.project === 'object' ? doc.project.id : doc.project,
            projectName: typeof doc.project === 'object' ? doc.project.name : null,
            assignedTo: typeof doc.assignedTo === 'object' ? doc.assignedTo.id : doc.assignedTo,
            assignedToName: typeof doc.assignedTo === 'object' ? doc.assignedTo.name : null,
            assignedToEmail: typeof doc.assignedTo === 'object' ? doc.assignedTo.email : null,
            priority: doc.priority,
            status: doc.status,
            dueDate: doc.dueDate,
            estimatedHours: doc.estimatedHours,
            createdAt: doc.createdAt,
          }, {
            source: 'task_creation',
            collection: 'tasks',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })
        } else if (operation === 'update' && previousDoc) {
          // Событие назначения задачи
          if (doc.assignedTo !== previousDoc.assignedTo) {
            await eventService.publishEvent('task.assigned', {
              id: doc.id,
              title: doc.title,
              project: typeof doc.project === 'object' ? doc.project.id : doc.project,
              projectName: typeof doc.project === 'object' ? doc.project.name : null,
              previousAssignee: typeof previousDoc.assignedTo === 'object' ? previousDoc.assignedTo.id : previousDoc.assignedTo,
              newAssignee: typeof doc.assignedTo === 'object' ? doc.assignedTo.id : doc.assignedTo,
              newAssigneeName: typeof doc.assignedTo === 'object' ? doc.assignedTo.name : null,
              newAssigneeEmail: typeof doc.assignedTo === 'object' ? doc.assignedTo.email : null,
              priority: doc.priority,
              dueDate: doc.dueDate,
              assignedAt: new Date().toISOString(),
            }, {
              source: 'task_assignment',
              collection: 'tasks',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие завершения задачи
          if (doc.status === 'completed' && previousDoc.status !== 'completed') {
            await eventService.publishEvent('task.completed', {
              id: doc.id,
              title: doc.title,
              description: doc.description,
              project: typeof doc.project === 'object' ? doc.project.id : doc.project,
              projectName: typeof doc.project === 'object' ? doc.project.name : null,
              assignedTo: typeof doc.assignedTo === 'object' ? doc.assignedTo.id : doc.assignedTo,
              assignedToName: typeof doc.assignedTo === 'object' ? doc.assignedTo.name : null,
              assignedToEmail: typeof doc.assignedTo === 'object' ? doc.assignedTo.email : null,
              priority: doc.priority,
              estimatedHours: doc.estimatedHours,
              actualHours: doc.actualHours,
              completedAt: doc.completedAt,
              duration: doc.createdAt && doc.completedAt ?
                Math.round((new Date(doc.completedAt).getTime() - new Date(doc.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : null,
            }, {
              source: 'task_completion',
              collection: 'tasks',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие просрочки задачи
          if (doc.dueDate && new Date(doc.dueDate) < new Date() && doc.status !== 'completed') {
            await eventService.publishEvent('task.overdue', {
              id: doc.id,
              title: doc.title,
              project: typeof doc.project === 'object' ? doc.project.id : doc.project,
              projectName: typeof doc.project === 'object' ? doc.project.name : null,
              assignedTo: typeof doc.assignedTo === 'object' ? doc.assignedTo.id : doc.assignedTo,
              assignedToName: typeof doc.assignedTo === 'object' ? doc.assignedTo.name : null,
              assignedToEmail: typeof doc.assignedTo === 'object' ? doc.assignedTo.email : null,
              priority: doc.priority,
              dueDate: doc.dueDate,
              daysOverdue: Math.floor((Date.now() - new Date(doc.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
              status: doc.status,
            }, {
              source: 'task_overdue',
              collection: 'tasks',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }
        }
      },
    ],
  },
  timestamps: true,
}

export default Tasks

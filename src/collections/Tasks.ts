import { CollectionConfig, Access } from 'payload'
import { isAdmin } from '@/access/isAdmin'

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
        { label: 'Новая', value: 'new' },
        { label: 'В работе', value: 'in_progress' },
        { label: 'Завершена', value: 'completed' },
      ],
      defaultValue: 'new',
      required: true,
      localized: true,
      admin: {
        description: 'Статус задачи',
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
  timestamps: true,
}

export default Tasks

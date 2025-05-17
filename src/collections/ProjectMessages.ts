import { CollectionConfig, Access } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { isAdmin } from '@/access/isAdmin'

// Функция доступа для проверки является ли пользователь заказчиком проекта или администратором
const isAdminOrProjectCustomer: Access = async ({ req, id, data }) => {
  const { user, payload } = req

  if (!user) return false

  // Администраторы имеют полный доступ
  if (user.roles?.includes('admin')) return true

  let projectId

  // Для обновления или удаления получаем проект из существующего сообщения
  if (id) {
    try {
      const message = await payload.findByID({
        collection: 'project-messages',
        id: String(id),
      })

      projectId = message.project
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

const ProjectMessages: CollectionConfig = {
  slug: 'project-messages',
  admin: {
    useAsTitle: 'createdAt',
    defaultColumns: ['author', 'project', 'createdAt'],
    group: 'E-commerce',
  },
  access: {
    create: isAdminOrProjectCustomer,
    read: isAdminOrProjectCustomer,
    update: ({ req: { user } }) => {
      // Только администраторы могут редактировать сообщения
      if (!user) return false
      return user.roles?.includes('admin')
    },
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
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Автор сообщения',
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ req }) => {
            // Автоматически устанавливаем текущего пользователя как автора
            return req.user?.id
          },
        ],
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor({}),
      admin: {
        description: 'Текст сообщения',
      },
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Прикрепленные файлы',
      },
    },
    {
      name: 'isSystemMessage',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Системное сообщение',
        readOnly: false,
      },
    },
  ],
  timestamps: true,
}

export default ProjectMessages

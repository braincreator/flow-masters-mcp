import { CollectionConfig } from 'payload/types'
export const ProjectFiles: CollectionConfig = {
  slug: 'project-files',
  admin: {
    useAsTitle: 'file',
  },
  access: {
    read: ({ req: { user } }) => !!user, // Только авторизованные пользователи могут читать
    create: ({ req: { user } }) => !!user, // Только авторизованные пользователи могут создавать
    update: ({ req: { user } }) => !!user, // Только авторизованные пользователи могут обновлять
    delete: ({ req: { user } }) => !!user, // Только авторизованные пользователи могут удалять
  },
  fields: [
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'service-projects',
      required: true,
      index: true,
    },
    {
      name: 'file',
      type: 'relationship',
      relationTo: 'media',
      required: true,
      index: true,
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      // Автоматически заполняется хуком
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'category',
      type: 'text',
      defaultValue: 'default',
    },
  ],
  hooks: {
    beforeValidate: [
      ({ req, data }) => {
        if (req.user) {
          data.uploadedBy = req.user.id
        }
        return data
      },
    ],
  },
}

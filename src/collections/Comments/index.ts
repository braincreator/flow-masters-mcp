import { CollectionConfig } from 'payload/types'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['content', 'author', 'post', 'status', 'createdAt'],
  },
  access: {
    read: () => true, // Anyone can read comments
    create: () => true, // Anyone can create comments
    update: ({ req: { user } }) => Boolean(user?.role === 'admin'),
    delete: ({ req: { user } }) => Boolean(user?.role === 'admin'),
  },
  fields: [
    {
      name: 'content',
      type: 'textarea',
      required: true,
      minLength: 5,
    },
    {
      name: 'author',
      type: 'group',
      required: true,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          required: true,
        },
        {
          name: 'website',
          type: 'text',
          admin: {
            description: 'Optional website URL',
          },
        },
      ],
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      hasMany: false,
    },
    {
      name: 'parentComment',
      type: 'relationship',
      relationTo: 'comments',
      hasMany: false,
      admin: {
        description: 'Optional parent comment for replies',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Approved',
          value: 'approved',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
      ],
    },
  ],
  timestamps: true,
}

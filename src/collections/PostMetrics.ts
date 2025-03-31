import type { CollectionConfig } from 'payload'

export const PostMetrics: CollectionConfig = {
  slug: 'post-metrics',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'post', 'views', 'shareCount', 'lastUpdated'],
    group: 'Blog',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Automatically generated from post title',
      },
      hooks: {
        beforeChange: [
          async ({ data, req }) => {
            if (data.post && req.payload) {
              const post = await req.payload.findByID({
                collection: 'posts',
                id: data.post,
              })
              return post?.title || 'Untitled Post'
            }
            return data.title || 'Untitled Post'
          },
        ],
      },
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      hasMany: false,
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'uniqueVisitors',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'shares',
      type: 'array',
      admin: {
        description: 'Record of individual share events',
      },
      fields: [
        {
          name: 'platform',
          type: 'text',
          required: true,
        },
        {
          name: 'date',
          type: 'date',
          required: true,
        },
      ],
    },
    {
      name: 'shareCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'likes',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'readingProgress',
      type: 'array',
      admin: {
        description: 'Reading progress tracking events',
      },
      fields: [
        {
          name: 'progress',
          type: 'number',
          required: true,
          min: 0,
          max: 100,
        },
        {
          name: 'date',
          type: 'date',
          required: true,
        },
      ],
    },
    {
      name: 'completedReads',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'lastUpdated',
      type: 'date',
    },
  ],
}

import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const PostMetrics: CollectionConfig = {
  slug: 'post-metrics',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'postTitle',
    defaultColumns: ['postTitle', 'views', 'shares', 'averageReadTime'],
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      hasMany: false,
      admin: {
        description: 'The post these metrics belong to',
      },
    },
    {
      name: 'postTitle',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Automatically populated from post title',
      },
    },
    {
      name: 'views',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of views for this post',
      },
    },
    {
      name: 'uniqueVisitors',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of unique visitors for this post',
      },
    },
    {
      name: 'shares',
      type: 'group',
      fields: [
        {
          name: 'total',
          label: 'Total Shares',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'twitter',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'facebook',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'linkedin',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'email',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'averageReadTime',
      type: 'number',
      admin: {
        description: 'Average time spent on this post in seconds',
      },
    },
    {
      name: 'completionRate',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description: 'Percentage of visitors who read the entire post',
      },
    },
    {
      name: 'referrers',
      type: 'array',
      fields: [
        {
          name: 'source',
          type: 'text',
          required: true,
        },
        {
          name: 'count',
          type: 'number',
          required: true,
          defaultValue: 1,
        },
      ],
    },
    {
      name: 'lastUpdated',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // Fetch post title when creating or updating
        if (data.post && (operation === 'create' || data.post !== originalDoc?.post)) {
          try {
            const post = await req.payload.findByID({
              collection: 'posts',
              id: data.post,
            })

            data.postTitle = post.title
          } catch (error) {
            // If post doesn't exist or error occurs, leave title blank
            data.postTitle = 'Unknown post'
          }
        }

        // Set lastUpdated timestamp
        data.lastUpdated = new Date().toISOString()

        return data
      },
    ],
  },
}

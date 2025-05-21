import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrProjectCustomer } from '../access/isAdminOrProjectCustomer'

const ProjectFeedback: CollectionConfig = {
  slug: 'project-feedback',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['project', 'feedbackType', 'rating', 'createdAt'],
    group: 'E-commerce',
  },
  access: {
    create: isAdminOrProjectCustomer,
    read: isAdminOrProjectCustomer,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'service-projects',
      required: true,
      admin: {
        description: 'The project this feedback is for',
      },
    },
    {
      name: 'milestone',
      type: 'relationship',
      relationTo: 'project-milestones',
      admin: {
        description: 'The milestone this feedback is for (if applicable)',
        condition: (data) => data.feedbackType === 'milestone',
      },
    },
    {
      name: 'feedbackType',
      type: 'select',
      options: [
        { label: 'Milestone', value: 'milestone' },
        { label: 'Periodic Survey', value: 'survey' },
        { label: 'Project Completion', value: 'completion' },
      ],
      required: true,
      admin: {
        description: 'Type of feedback',
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      required: true,
      admin: {
        description: 'Satisfaction rating (1-5)',
      },
    },
    {
      name: 'aspectRatings',
      type: 'group',
      admin: {
        description: 'Ratings for specific aspects of the service',
        condition: (data) => data.feedbackType === 'survey' || data.feedbackType === 'completion',
      },
      fields: [
        {
          name: 'communication',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Communication rating (1-5)',
          },
        },
        {
          name: 'quality',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Quality rating (1-5)',
          },
        },
        {
          name: 'timeliness',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Timeliness rating (1-5)',
          },
        },
        {
          name: 'valueForMoney',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Value for money rating (1-5)',
          },
        },
      ],
    },
    {
      name: 'comment',
      type: 'textarea',
      admin: {
        description: 'Additional comments or feedback',
      },
    },
    {
      name: 'submittedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who submitted the feedback',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, data }) => {
        // Set the submittedBy field to the current user
        if (req.user) {
          return {
            ...data,
            submittedBy: req.user.id,
          }
        }
        return data
      },
    ],
  },
}

export default ProjectFeedback

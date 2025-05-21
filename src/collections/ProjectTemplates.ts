import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

const ProjectTemplates: CollectionConfig = {
  slug: 'project-templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'createdAt'],
    group: 'E-commerce',
    description: 'Templates for service projects',
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Template name',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Template description',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'AI Development', value: 'ai_development' },
        { label: 'Machine Learning', value: 'machine_learning' },
        { label: 'Data Analysis', value: 'data_analysis' },
        { label: 'Chatbot', value: 'chatbot' },
        { label: 'Integration', value: 'integration' },
        { label: 'Custom', value: 'custom' },
      ],
      required: true,
      admin: {
        description: 'Template category',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Tags for filtering templates',
      },
    },
    {
      name: 'estimatedDuration',
      type: 'group',
      admin: {
        description: 'Estimated project duration',
      },
      fields: [
        {
          name: 'value',
          type: 'number',
          required: true,
          min: 1,
          admin: {
            description: 'Duration value',
          },
        },
        {
          name: 'unit',
          type: 'select',
          options: [
            { label: 'Days', value: 'days' },
            { label: 'Weeks', value: 'weeks' },
            { label: 'Months', value: 'months' },
          ],
          defaultValue: 'weeks',
          required: true,
          admin: {
            description: 'Duration unit',
          },
        },
      ],
    },
    {
      name: 'overview',
      type: 'richText',
      editor: lexicalEditor({}),
      admin: {
        description: 'Project overview template',
      },
    },
    {
      name: 'milestones',
      type: 'array',
      admin: {
        description: 'Project milestones',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'Milestone title',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Milestone description',
          },
        },
        {
          name: 'order',
          type: 'number',
          required: true,
          admin: {
            description: 'Order in the milestone sequence (1, 2, 3, etc.)',
          },
        },
        {
          name: 'estimatedDuration',
          type: 'group',
          admin: {
            description: 'Estimated milestone duration',
          },
          fields: [
            {
              name: 'value',
              type: 'number',
              required: true,
              min: 1,
              admin: {
                description: 'Duration value',
              },
            },
            {
              name: 'unit',
              type: 'select',
              options: [
                { label: 'Days', value: 'days' },
                { label: 'Weeks', value: 'weeks' },
                { label: 'Months', value: 'months' },
              ],
              defaultValue: 'days',
              required: true,
              admin: {
                description: 'Duration unit',
              },
            },
          ],
        },
        {
          name: 'dependsOn',
          type: 'array',
          admin: {
            description: 'Dependencies on other milestones',
          },
          fields: [
            {
              name: 'milestoneOrder',
              type: 'number',
              required: true,
              admin: {
                description: 'Order number of the milestone this depends on',
              },
            },
            {
              name: 'offsetDays',
              type: 'number',
              defaultValue: 0,
              admin: {
                description: 'Days to offset after the dependent milestone (can be negative)',
              },
            },
          ],
        },
        {
          name: 'deliverables',
          type: 'array',
          admin: {
            description: 'Milestone deliverables',
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: {
                description: 'Deliverable name',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'Deliverable description',
              },
            },
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Document', value: 'document' },
                { label: 'Code', value: 'code' },
                { label: 'Design', value: 'design' },
                { label: 'Model', value: 'model' },
                { label: 'Data', value: 'data' },
                { label: 'Other', value: 'other' },
              ],
              required: true,
              admin: {
                description: 'Deliverable type',
              },
            },
          ],
        },
        {
          name: 'requiresClientApproval',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Whether this milestone requires client approval',
          },
        },
      ],
    },
    {
      name: 'tasks',
      type: 'array',
      admin: {
        description: 'Project tasks',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'Task title',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Task description',
          },
        },
        {
          name: 'relatedMilestoneOrder',
          type: 'number',
          required: true,
          admin: {
            description: 'Order number of the related milestone',
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
          name: 'assigneeRole',
          type: 'select',
          options: [
            { label: 'Project Manager', value: 'project_manager' },
            { label: 'Developer', value: 'developer' },
            { label: 'Designer', value: 'designer' },
            { label: 'Data Scientist', value: 'data_scientist' },
            { label: 'QA Engineer', value: 'qa_engineer' },
            { label: 'Unassigned', value: 'unassigned' },
          ],
          defaultValue: 'unassigned',
          admin: {
            description: 'Default role for task assignee',
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this template is active and available for use',
      },
    },
    {
      name: 'version',
      type: 'number',
      defaultValue: 1,
      admin: {
        description: 'Template version number',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ req, operation }) => {
            if (operation === 'create') {
              return req.user.id
            }
          },
        ],
      },
    },
  ],
  timestamps: true,
}

export default ProjectTemplates

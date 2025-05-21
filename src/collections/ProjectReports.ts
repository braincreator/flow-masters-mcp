import { CollectionConfig, Access } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

// Access control function to check if user is admin or project customer
const isAdminOrProjectCustomer: Access = ({ req: { user } }) => {
  if (!user) return false

  // Administrators have full access
  if (user.roles?.includes('admin')) return true

  // For read access, customers can only access reports for their projects
  return {
    'project.customer': {
      equals: user.id,
    },
  }
}

const ProjectReports: CollectionConfig = {
  slug: 'project-reports',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'project', 'reportType', 'reportPeriod', 'createdAt'],
    group: 'E-commerce',
    description: 'Automated status reports for service projects',
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
        description: 'Report title',
      },
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'service-projects',
      required: true,
      admin: {
        description: 'Related project',
      },
    },
    {
      name: 'reportType',
      type: 'select',
      options: [
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Milestone', value: 'milestone' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'weekly',
      required: true,
      admin: {
        description: 'Type of report',
      },
    },
    {
      name: 'reportPeriod',
      type: 'group',
      admin: {
        description: 'Reporting period',
      },
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          admin: {
            description: 'Start date of the reporting period',
            date: {
              pickerAppearance: 'dayAndTime',
              timeFormat: '24hr',
            },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          required: true,
          admin: {
            description: 'End date of the reporting period',
            date: {
              pickerAppearance: 'dayAndTime',
              timeFormat: '24hr',
            },
          },
        },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Executive summary of the report',
      },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({}),
      admin: {
        description: 'Detailed report content',
      },
    },
    {
      name: 'progressMetrics',
      type: 'group',
      admin: {
        description: 'Project progress metrics',
      },
      fields: [
        {
          name: 'completionPercentage',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Overall project completion percentage',
          },
        },
        {
          name: 'milestonesTotal',
          type: 'number',
          admin: {
            description: 'Total number of milestones',
          },
        },
        {
          name: 'milestonesCompleted',
          type: 'number',
          admin: {
            description: 'Number of completed milestones',
          },
        },
        {
          name: 'milestonesInProgress',
          type: 'number',
          admin: {
            description: 'Number of in-progress milestones',
          },
        },
        {
          name: 'milestonesDelayed',
          type: 'number',
          admin: {
            description: 'Number of delayed milestones',
          },
        },
      ],
    },
    {
      name: 'activitySummary',
      type: 'group',
      admin: {
        description: 'Summary of activities during the reporting period',
      },
      fields: [
        {
          name: 'messagesCount',
          type: 'number',
          admin: {
            description: 'Number of messages exchanged',
          },
        },
        {
          name: 'filesCount',
          type: 'number',
          admin: {
            description: 'Number of files shared',
          },
        },
        {
          name: 'milestonesCompletedInPeriod',
          type: 'number',
          admin: {
            description: 'Number of milestones completed in this period',
          },
        },
      ],
    },
    {
      name: 'recentMilestones',
      type: 'relationship',
      relationTo: 'project-milestones',
      hasMany: true,
      admin: {
        description: 'Recent or relevant milestones',
      },
    },
    {
      name: 'upcomingMilestones',
      type: 'relationship',
      relationTo: 'project-milestones',
      hasMany: true,
      admin: {
        description: 'Upcoming milestones',
      },
    },
    {
      name: 'sentToClient',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this report has been sent to the client',
      },
    },
    {
      name: 'clientViewed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the client has viewed this report',
      },
    },
    {
      name: 'generatedAutomatically',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this report was generated automatically by the system',
      },
    },
  ],
  timestamps: true,
}

export default ProjectReports

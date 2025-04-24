import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'

export const CourseEnrollments: CollectionConfig = {
  slug: 'course-enrollments',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'course', 'status', 'enrolledAt', 'expiresAt'],
    group: 'Learning Management',
    description: 'Tracks user enrollments and access to courses',
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'User who has access to the course',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: {
        description: 'Course the user has access to',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Expired', value: 'expired' },
        { label: 'Revoked', value: 'revoked' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Current status of the enrollment',
      },
    },
    {
      name: 'enrolledAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the user was enrolled in the course',
      },
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the enrollment expires (if applicable)',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the user completed the course (if applicable)',
      },
    },
    {
      name: 'progress',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
      admin: {
        description: 'Percentage of course completion (0-100)',
      },
    },
    {
      name: 'lastAccessedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the user last accessed the course',
      },
    },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Purchase', value: 'purchase' },
        { label: 'Admin Grant', value: 'admin' },
        { label: 'Promotion', value: 'promotion' },
        { label: 'Subscription', value: 'subscription' },
      ],
      defaultValue: 'purchase',
      admin: {
        description: 'How the user got access to this course',
      },
    },
    {
      name: 'orderId',
      type: 'relationship',
      relationTo: 'orders',
      admin: {
        description: 'Order that granted access to this course (if applicable)',
        condition: (data) => data?.source === 'purchase',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Administrative notes about this enrollment',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // If enrollment status changes to completed, update analytics
        if (operation === 'update' && doc.status === 'completed' && doc.completedAt) {
          try {
            const serviceRegistry = req.payload.services
            if (serviceRegistry) {
              const analyticsService = serviceRegistry.getAnalyticsService()
              await analyticsService.trackEvent({
                courseId: doc.course,
                userId: doc.user,
                eventType: 'completion',
                value: 100,
              })
            }
          } catch (error) {
            console.error('Error updating analytics after course completion:', error)
          }
        }
      },
    ],
  },
  timestamps: true,
}

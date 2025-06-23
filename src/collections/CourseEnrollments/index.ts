import type { CollectionConfig, Payload } from 'payload' // Import Payload type
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'
import { ServiceRegistry } from '@/services/service.registry' // Import ServiceRegistry
import { handleWaitingList } from './hooks/handleWaitingList' // Import the hook
import { notifyWaitingListOnStatusChange, notifyWaitingListOnDelete } from './hooks/notifyWaitingListOnVacancy' // Import new hooks

// Module augmentation moved to src/types/payload.d.ts

export const CourseEnrollments: CollectionConfig = {
  slug: 'course-enrollments',
  admin: {
    useAsTitle: 'id', // TODO: Consider a hook or custom component for a more descriptive title (e.g., "User - Course")
    defaultColumns: ['user', 'course', 'status', 'progress', 'enrolledAt', 'expiresAt'],
    listSearchableFields: ['user', 'course'], // Search by related user/course
    group: 'Learning Management',
    description: 'Tracks user enrollments and access to courses',
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdmin,
    delete: isAdmin,
  },
  // Group date fields into a tab
  fields: [ // Re-declare fields to use tabs structure
    // ... keep user, course, status fields as defined above ...
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, admin: { position: 'sidebar', description: 'User who has access to the course' } },
    { name: 'course', type: 'relationship', relationTo: 'courses', required: true, admin: { description: 'Course the user has access to' } },
    { name: 'status', type: 'select', required: true, defaultValue: 'active', options: [ { label: 'Active', value: 'active' }, { label: 'Completed', value: 'completed' }, { label: 'Expired', value: 'expired' }, { label: 'Revoked', value: 'revoked' } ], admin: { position: 'sidebar', description: 'Current status of the enrollment' } },
    { name: 'progress', type: 'number', min: 0, max: 100, defaultValue: 0, admin: { description: 'Percentage of course completion (0-100)', position: 'sidebar' } },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          fields: [
            { name: 'source', type: 'select', options: [ { label: 'Purchase', value: 'purchase' }, { label: 'Admin Grant', value: 'admin' }, { label: 'Promotion', value: 'promotion' }, { label: 'Subscription', value: 'subscription' } ], defaultValue: 'purchase', admin: { description: 'How the user got access to this course' } },
            { name: 'orderId', type: 'relationship', relationTo: 'orders', admin: { description: 'Order that granted access to this course (if applicable)', condition: (data) => data?.source === 'purchase' } },
            { name: 'notes', type: 'textarea', admin: { description: 'Administrative notes about this enrollment' } },
          ],
        },
        {
          label: 'Dates',
          fields: [
            {
              name: 'enrolledAt', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'When the user was enrolled in the course' }, defaultValue: () => new Date().toISOString(),
            },
            {
              name: 'expiresAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'When the enrollment expires (if applicable)' },
            },
            {
              name: 'completedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'When the user completed the course (if applicable)' },
            },
            {
              name: 'lastAccessedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'When the user last accessed the course' },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [handleWaitingList], // Add beforeChange hook
    afterChange: [
      // Existing afterChange hook for analytics
      async ({ doc, req, operation }) => {
        // If enrollment status changes to completed, update analytics
        if (operation === 'update' && doc.status === 'completed' && doc.completedAt) {
          try {
            // Now req.payload.services should be recognized due to module augmentation
            // Get ServiceRegistry instance using the req.payload
            const serviceRegistry = ServiceRegistry.getInstance(req.payload);
            if (serviceRegistry) {
              const analyticsService = serviceRegistry.getCourseAnalyticsService()
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
      // Добавляем хук для событий записи на курсы
      async ({ doc, previousDoc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Событие записи на курс
          await eventService.publishEvent('course.enrolled', {
            id: doc.id,
            course: typeof doc.course === 'object' ? doc.course.id : doc.course,
            courseTitle: typeof doc.course === 'object' ? doc.course.title : null,
            user: typeof doc.user === 'object' ? doc.user.id : doc.user,
            userName: typeof doc.user === 'object' ? doc.user.name : null,
            userEmail: typeof doc.user === 'object' ? doc.user.email : null,
            status: doc.status,
            enrolledAt: doc.enrolledAt,
            expiresAt: doc.expiresAt,
          }, {
            source: 'course_enrollment',
            collection: 'course-enrollments',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })
        } else if (operation === 'update' && previousDoc) {
          // Событие завершения курса
          if (doc.status === 'completed' && previousDoc.status !== 'completed') {
            await eventService.publishEvent('course.completed', {
              id: doc.id,
              course: typeof doc.course === 'object' ? doc.course.id : doc.course,
              courseTitle: typeof doc.course === 'object' ? doc.course.title : null,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              userName: typeof doc.user === 'object' ? doc.user.name : null,
              userEmail: typeof doc.user === 'object' ? doc.user.email : null,
              enrolledAt: doc.enrolledAt,
              completedAt: doc.completedAt,
              duration: doc.enrolledAt && doc.completedAt ?
                Math.round((new Date(doc.completedAt).getTime() - new Date(doc.enrolledAt).getTime()) / (1000 * 60 * 60 * 24)) : null,
            }, {
              source: 'course_completion',
              collection: 'course-enrollments',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие начала курса (первый доступ)
          if (doc.status === 'active' && previousDoc.status === 'enrolled') {
            await eventService.publishEvent('course.started', {
              id: doc.id,
              course: typeof doc.course === 'object' ? doc.course.id : doc.course,
              courseTitle: typeof doc.course === 'object' ? doc.course.title : null,
              user: typeof doc.user === 'object' ? doc.user.id : doc.user,
              userName: typeof doc.user === 'object' ? doc.user.name : null,
              userEmail: typeof doc.user === 'object' ? doc.user.email : null,
              enrolledAt: doc.enrolledAt,
              startedAt: new Date().toISOString(),
            }, {
              source: 'course_start',
              collection: 'course-enrollments',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }
        }
      },
      // Add the new afterChange hook for waiting list notification
      notifyWaitingListOnStatusChange,
    ],
    afterDelete: [notifyWaitingListOnDelete], // Add afterDelete hook
  },
  timestamps: true,
}

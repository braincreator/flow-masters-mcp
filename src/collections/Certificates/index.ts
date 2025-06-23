import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'
import { ServiceRegistry } from '@/services/service.registry'

export const Certificates: CollectionConfig = {
  slug: 'certificates',
  admin: {
    useAsTitle: 'certificateId',
    listSearchableFields: ['certificateId', 'user', 'course'],
    defaultColumns: ['certificateId', 'user', 'course', 'completionDate', 'status'],
    group: 'Learning Management',
    description: 'Course completion certificates',
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'certificateId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier for the certificate',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'User who earned the certificate',
      },
    },
    {
      name: 'userName',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of the user as it appears on the certificate',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: {
        description: 'Course the certificate is for',
      },
    },
    {
      name: 'courseTitle',
      type: 'text',
      required: true,
      admin: {
        description: 'Title of the course as it appears on the certificate',
      },
    },
    {
      name: 'completionDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the user completed the course',
      },
    },
    {
      name: 'issueDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the certificate was issued',
      },
    },
    {
      name: 'instructor',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Course instructor',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Revoked', value: 'revoked' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Current status of the certificate',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for the certificate',
      },
    },
  ],
  hooks: {
    afterChange: [
      // Добавляем хук для событий сертификатов
      async ({ doc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Событие выдачи сертификата
          await eventService.publishEvent('certificate.issued', {
            id: doc.id,
            certificateNumber: doc.certificateNumber,
            course: typeof doc.course === 'object' ? doc.course.id : doc.course,
            courseTitle: typeof doc.course === 'object' ? doc.course.title : null,
            user: typeof doc.user === 'object' ? doc.user.id : doc.user,
            userName: typeof doc.user === 'object' ? doc.user.name : null,
            userEmail: typeof doc.user === 'object' ? doc.user.email : null,
            instructor: typeof doc.instructor === 'object' ? doc.instructor.id : doc.instructor,
            instructorName: typeof doc.instructor === 'object' ? doc.instructor.name : null,
            issuedAt: doc.issuedAt,
            status: doc.status,
            metadata: doc.metadata,
          }, {
            source: 'certificate_issued',
            collection: 'certificates',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })
        }
      },
    ],
  },
  timestamps: true,
}

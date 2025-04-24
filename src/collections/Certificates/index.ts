import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'

export const Certificates: CollectionConfig = {
  slug: 'certificates',
  admin: {
    useAsTitle: 'certificateId',
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
  timestamps: true,
}

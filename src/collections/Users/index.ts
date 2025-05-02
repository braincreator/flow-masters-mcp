import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin, isAdminAccessCheck } from '@/access/isAdmin' // Import the new function
import { ServiceRegistry } from '@/services/service.registry'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 365 * 100, // 100 years in seconds
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // 10 minutes
  },
  access: {
    admin: isAdminAccessCheck, // Use the correctly typed function
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    group: 'User Management',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
  },
  // hooks: {
  //   afterChange: [
  //     async ({ doc, req, operation }) => {
  //       if (operation === 'create' || operation === 'update') {
  //         // Temporarily commented out to debug generate:types hang
  //         // const serviceRegistry = ServiceRegistry.getInstance(req.payload)
  //         // const integrationService = serviceRegistry.getIntegrationService()
  //         // await integrationService.processEvent('user.registered', {
  //         //   id: doc.id,
  //         //   email: doc.email,
  //         //   name: doc.name,
  //         //   role: doc.role, // Note: This might need updating to doc.roles if used
  //         //   createdAt: doc.createdAt,
  //         // })
  //         req.payload.logger.info(`User hook triggered for ${operation} on doc ${doc.id} - Logic commented out.`);
  //       }
  //     },
  //   ],
  // },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles', // Renamed to plural
      label: 'Roles',
      type: 'select',
      hasMany: true, // Changed to allow multiple roles
      required: true,
      defaultValue: ['customer'], // Default as array
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Instructor', // Added Instructor role
          value: 'instructor',
        },
        {
          label: 'Customer',
          value: 'customer',
        },
      ],
      access: {
        // Only Admins should be able to change roles directly
        update: isAdminAccessCheck, // Use the correctly typed function
        create: isAdminAccessCheck, // Use the correctly typed function
      },
      admin: {
        description: 'Determines user capabilities within the platform.',
      },
    },
    // --- NEW Instructor-Specific Fields ---
    {
      name: 'instructorBio',
      label: 'Instructor Biography',
      type: 'richText',
      admin: {
        condition: (_, siblingData) => siblingData.roles?.includes('instructor'),
      },
    },
    {
      name: 'expertiseAreas', // Using the relationship approach
      label: 'Areas of Expertise',
      type: 'relationship',
      relationTo: 'expertise-tags', // Ensure ExpertiseTags collection exists and is registered
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData.roles?.includes('instructor'),
        description: 'Select relevant expertise tags (managed by Admins).',
        // allowCreate: false (default) - Admins manage tags
      },
    },
    {
      name: 'qualifications',
      label: 'Qualifications/Credentials',
      type: 'textarea',
      admin: {
        condition: (_, siblingData) => siblingData.roles?.includes('instructor'),
      },
    },
    {
      name: 'instructorProfilePicture',
      label: 'Instructor Profile Picture',
      type: 'upload',
      relationTo: 'media', // Assuming 'media' collection exists
      admin: {
        condition: (_, siblingData) => siblingData.roles?.includes('instructor'),
      },
    },
    {
      name: 'socialMediaLinks',
      label: 'Social Media Links',
      type: 'array',
      admin: {
        condition: (_, siblingData) => siblingData.roles?.includes('instructor'),
        description:
          'Add links to relevant social media profiles (e.g., LinkedIn, Twitter, Personal Website).',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            // Add more platforms as needed
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'GitHub', value: 'github' },
            { label: 'Personal Website', value: 'website' },
            { label: 'Other', value: 'other' },
          ],
          required: true,
        },
        {
          name: 'url',
          type: 'text', // Consider using 'url' type for validation
          required: true,
        },
      ],
    },
    // --- End of Instructor Fields ---
    {
      name: 'locale',
      label: 'Preferred Language',
      type: 'select',
      defaultValue: 'ru',
      options: [
        {
          label: 'Russian',
          value: 'ru',
        },
        {
          label: 'English',
          value: 'en',
        },
      ],
    },
    {
      name: 'resetPasswordToken',
      type: 'text',
      access: {
        read: () => false,
        create: () => false,
        update: () => false,
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: 'resetPasswordExpiration',
      type: 'date',
      access: {
        read: () => false,
        create: () => false,
        update: () => false,
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: 'emailNotifications',
      type: 'json',
      admin: {
        description: 'Email notification preferences',
      },
    },
    {
      name: 'pushNotifications',
      type: 'json',
      admin: {
        description: 'Push notification preferences',
      },
    },
    {
      name: 'notificationFrequency',
      type: 'select',
      defaultValue: 'immediately',
      options: [
        { label: 'Immediately', value: 'immediately' },
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Never', value: 'never' },
      ],
      admin: {
        description: 'How often to receive notifications',
      },
    },
    {
      name: 'segments',
      label: 'Сегменты пользователя (автоматически)',
      type: 'relationship',
      relationTo: 'user-segments',
      hasMany: true,
      access: {
        create: () => false,
        update: () => false,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description:
          'Сегменты, к которым относится пользователь. Вычисляются и обновляются автоматически.',
      },
    },
    {
      name: 'xp',
      label: 'Очки опыта (XP)',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        position: 'sidebar',
        description: 'Очки опыта пользователя, заработанные за достижения и активность',
      },
    },
    {
      name: 'level',
      label: 'Уровень',
      type: 'number',
      defaultValue: 1,
      min: 1,
      admin: {
        position: 'sidebar',
        description: 'Текущий уровень пользователя, основанный на количестве XP',
        readOnly: true,
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },
  ],
  timestamps: true,
}

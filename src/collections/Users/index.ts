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
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Событие регистрации пользователя
          await eventService.publishEvent('user.registered', {
            id: doc.id,
            email: doc.email,
            name: doc.name,
            roles: doc.roles,
            createdAt: doc.createdAt,
          }, {
            source: 'user_registration',
            collection: 'users',
            operation,
            userId: doc.id,
            userEmail: doc.email,
          })
        } else if (operation === 'update') {
          // Событие обновления профиля пользователя
          await eventService.publishEvent('user.updated', {
            id: doc.id,
            email: doc.email,
            name: doc.name,
            roles: doc.roles,
            updatedAt: new Date().toISOString(),
          }, {
            source: 'user_profile_update',
            collection: 'users',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })
        }
      },
    ],
  },
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
      name: 'notificationPreferences',
      label: 'Notification Preferences',
      type: 'group',
      admin: {
        description: 'Manage your notification settings.',
      },
      fields: [
        {
          name: 'email',
          label: 'Email Notifications',
          type: 'group',
          fields: [
            {
              name: 'orderUpdates',
              label: 'Order Updates',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description:
                  'Receive updates about your orders (e.g., confirmation, shipping, cancellation).',
              },
            },
            {
              name: 'subscriptionUpdates',
              label: 'Subscription Updates',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description:
                  'Receive updates about your subscriptions (e.g., activation, renewal, payment issues).',
              },
            },
            {
              name: 'accountActivity',
              label: 'Account Activity',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description:
                  'Receive notifications for important account activities (e.g., welcome email, security alerts).',
              },
            },
            {
              name: 'marketingAndPromotions',
              label: 'Marketing and Promotions',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Receive promotional offers, news about new products, and special deals.',
              },
            },
            {
              name: 'productNewsAndTips',
              label: 'Product News and Tips',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Receive updates about new features, platform improvements, and helpful tips.',
              },
            },
          ],
        },
      ],
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
      name: 'passwordResetRequired',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Указывает, что пользователю нужно сбросить пароль при следующем входе',
        position: 'sidebar',
      },
      access: {
        read: isAdminAccessCheck,
        update: isAdminAccessCheck,
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

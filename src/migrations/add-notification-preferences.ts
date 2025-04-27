import { MigrateUpArgs, MigrateDownArgs } from 'payload/dist/migrations/types'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Add notification preference fields to the users collection
  await payload.updateCollection({
    slug: 'users',
    fields: [
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
    ],
  })
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Remove notification preference fields from the users collection
  await payload.updateCollection({
    slug: 'users',
    fields: [
      {
        name: 'emailNotifications',
        type: 'json',
        admin: {
          description: 'Email notification preferences',
        },
        _delete: true,
      },
      {
        name: 'pushNotifications',
        type: 'json',
        admin: {
          description: 'Push notification preferences',
        },
        _delete: true,
      },
      {
        name: 'notificationFrequency',
        type: 'select',
        admin: {
          description: 'How often to receive notifications',
        },
        _delete: true,
      },
    ],
  })
}

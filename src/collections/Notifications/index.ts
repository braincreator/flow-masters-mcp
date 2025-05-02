import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    listSearchableFields: ['title', 'user', 'type'],
    defaultColumns: ['title', 'user', 'type', 'isRead', 'createdAt'],
    group: 'System', // Group with other system collections
    description: 'User notifications',
  },
  access: {
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Notification title',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Notification message',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'User who received the notification',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        // Course Related
        { label: 'Course Enrolled', value: 'course_enrolled' }, // NEW
        { label: 'Lesson Completed', value: 'lesson_completed' }, // NEW
        { label: 'Module Completed', value: 'module_completed' }, // NEW
        { label: 'Assessment Submitted', value: 'assessment_submitted' }, // NEW (Useful for assignments)
        { label: 'Assessment Graded', value: 'assessment_graded' }, // NEW
        { label: 'Course Completed', value: 'course_completed' }, // Existing
        { label: 'Certificate Issued', value: 'certificate_issued' }, // Renamed/Clarified from 'certificate'
        // Gamification
        { label: 'Achievement Unlocked', value: 'achievement_unlocked' }, // Renamed/Clarified from 'achievement'
        { label: 'Level Up', value: 'level_up' }, // Existing
        // General
        { label: 'System Alert', value: 'system_alert' }, // Renamed/Clarified from 'system'
        { label: 'General Info', value: 'general_info' }, // Renamed/Clarified from 'other'
        // Add more specific types as needed (e.g., 'review_approved', 'new_comment')
      ],
      admin: {
        position: 'sidebar',
        description: 'Type of notification',
      },
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Whether the notification has been read',
      },
    },
    {
      name: 'link',
      type: 'text',
      admin: {
        description: 'Optional link to navigate to when clicking the notification',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for the notification',
        hidden: true, // Hide raw JSON from admin UI
      },
    },
  ],
  timestamps: true,
}

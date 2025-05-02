import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const Achievements: CollectionConfig = {
  slug: 'achievements',
  admin: {
    useAsTitle: 'title',
    listSearchableFields: ['title'],
    defaultColumns: ['title', 'type', 'xpAwarded', 'updatedAt'],
    group: 'Gamification', // Group with related features
    description: 'Definitions of achievements users can earn.',
  },
  access: {
    // Only admins can manage achievement definitions
    create: isAdmin,
    read: isAdmin, // Or maybe authenticated users can read definitions? Decide later.
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
      localized: true,
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Icon',
      required: true, // Require an icon for visual representation
    },
    {
      name: 'type',
      type: 'select',
      label: 'Achievement Type',
      required: true,
      options: [
        // Course Related
        { label: 'Course Started', value: 'course_started' },
        { label: 'Lesson Completed', value: 'lesson_completed' },
        { label: 'Module Completed', value: 'module_completed' }, // Added based on design doc notifications
        { label: 'Course Completed', value: 'course_completed' },
        { label: 'Progress Milestone', value: 'progress_milestone' },
        { label: 'Certificate Earned', value: 'certificate_earned' }, // Added based on design doc flows
        // Other potential types
        { label: 'Account Created', value: 'account_created' },
        { label: 'Profile Completed', value: 'profile_completed' },
        { label: 'First Purchase', value: 'first_purchase' },
        // Add more as needed
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'criteria',
      type: 'group', // Use group for better organization, can switch to JSON if needed
      label: 'Criteria',
      admin: {
        description: 'Conditions that must be met to earn this achievement.',
      },
      fields: [
        // Conditional fields based on 'type'
        {
          name: 'courseId',
          type: 'relationship',
          relationTo: 'courses',
          label: 'Specific Course',
          admin: {
            condition: (_, siblingData) =>
              siblingData?.type === 'course_started' ||
              siblingData?.type === 'course_completed' ||
              siblingData?.type === 'progress_milestone',
            description: 'Required for course-specific achievements.',
          },
        },
        {
          name: 'lessonCount',
          type: 'number',
          label: 'Number of Lessons',
          min: 1,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'lesson_completed',
            description: 'e.g., Complete 10 lessons (can be across any course).',
          },
        },
        {
          name: 'progressPercent',
          type: 'number',
          label: 'Progress Percentage',
          min: 1,
          max: 100,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'progress_milestone',
            description: 'e.g., Reach 50% progress in a specific course.',
          },
        },
        // Add more criteria fields as needed for other types
      ],
    },
    {
      name: 'xpAwarded',
      type: 'number',
      label: 'XP Awarded',
      defaultValue: 0,
      min: 0,
      admin: {
        position: 'sidebar',
        description: 'Experience points awarded for earning this achievement.',
      },
    },
  ],
  timestamps: true, // Adds createdAt and updatedAt
}

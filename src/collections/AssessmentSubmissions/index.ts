import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'

export const AssessmentSubmissions: CollectionConfig = {
  slug: 'assessment-submissions',
  admin: {
    useAsTitle: 'id', // Use ID as title, maybe improve later if needed
    defaultColumns: ['user', 'assessment', 'status', 'score', 'submittedAt'],
    group: 'Learning Management',
    description: 'Stores user submissions for assessments (quizzes/assignments).',
    // Hide from main nav, access through Assessment or User views?
    hidden: true,
  },
  access: {
    create: isAdminOrSelf, // Users create their own submissions
    read: isAdminOrSelf,   // Users can read their own submissions, admins can read all
    update: isAdminOrSelf, // Admins or users (e.g., resubmitting) - refine later if needed
    delete: isAdmin,       // Only admins can delete submissions
  },
  fields: [
    {
      name: 'assessment',
      type: 'relationship',
      relationTo: 'assessments',
      required: true,
      label: 'Assessment',
      admin: {
        readOnly: true, // Should be set programmatically
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'User',
      admin: {
        readOnly: true, // Should be set programmatically
        position: 'sidebar',
      },
    },
    {
      name: 'enrollment',
      type: 'relationship',
      relationTo: 'course-enrollments',
      required: true,
      label: 'Course Enrollment',
      admin: {
        readOnly: true, // Should be set programmatically
        description: 'Links submission to the specific course enrollment.',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      required: true,
      label: 'Submitted At',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      label: 'Status',
      options: [
        { label: 'Submitted', value: 'submitted' }, // Initial state
        { label: 'Grading', value: 'grading' },     // For manual grading (assignments/text answers)
        { label: 'Graded', value: 'graded' },       // Final state after grading
      ],
      defaultValue: 'submitted',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'score',
      type: 'number',
      label: 'Score (%)',
      min: 0,
      max: 100,
      admin: {
        description: 'Score achieved (0-100). Set after grading.',
        condition: (data) => data.status === 'graded',
      },
    },
    {
      name: 'answers',
      type: 'json',
      label: 'Answers (Quiz)',
      admin: {
        description: 'Stores the user\'s answers for quizzes.',
        hidden: true, // Hide raw JSON from admin UI by default
        // Consider making read-only or hiding if too complex for admin UI
      },
    },
    {
      name: 'files',
      type: 'array',
      label: 'Submitted Files (Assignment)',
      admin: {
        condition: (data, { relationData }) => relationData?.assessment?.type === 'assignment', // Check related assessment type
        description: 'Files submitted for an assignment.',
      },
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'File',
        },
      ],
    },
    {
      name: 'feedback',
      type: 'textarea',
      label: 'Feedback',
      admin: {
        description: 'Feedback provided to the user after grading.',
      },
    },
    {
      name: 'attemptNumber',
      type: 'number',
      required: true,
      label: 'Attempt Number',
      min: 1,
      admin: {
        readOnly: true, // Should be set programmatically
        position: 'sidebar',
      },
    },
  ],
  timestamps: true, // Adds createdAt and updatedAt
}
import type { CollectionConfig } from 'payload'

export const AssessmentSubmissions: CollectionConfig = {
  slug: 'assessment-submissions', // Ensure slug matches usage
  admin: {
    group: 'Learning Management',
    useAsTitle: 'id', // Or potentially link to user/assessment title
    defaultColumns: ['user', 'assessment', 'status', 'score', 'submittedAt'],
    description: 'Submissions for quizzes and assignments.',
  },
  labels: {
    singular: 'Assessment Submission',
    plural: 'Assessment Submissions',
  },
  access: {
    // Users can only read their own submissions
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      return { user: { equals: req.user?.id } };
    },
    // Users can create submissions (endpoint logic should verify enrollment)
    create: ({ req }) => !!req.user,
    // Admins/Instructors can update (e.g., grade, add feedback)
    update: ({ req }) => req.user?.role === 'admin', // Adjust if instructors need access
    // Admins can delete
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'assessment',
      type: 'relationship',
      relationTo: 'assessments', // Link to the Assessment collection
      required: true,
      label: 'Assessment',
      admin: {
        readOnly: true, // Usually set via endpoint
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'User',
      admin: {
        readOnly: true, // Usually set via endpoint
      },
    },
    {
      name: 'enrollment',
      type: 'relationship',
      relationTo: 'course-enrollments',
      required: true,
      label: 'Enrollment',
      admin: {
        readOnly: true, // Usually set via endpoint
      },
      index: true, // Index for potential lookups
    },
    {
      name: 'submittedAt',
      type: 'date',
      label: 'Submitted At',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        readOnly: true, // Set automatically
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { label: 'Submitted', value: 'submitted' },
        { label: 'Grading', value: 'grading' },
        { label: 'Graded', value: 'graded' },
      ],
      defaultValue: 'submitted',
      required: true,
    },
    {
      name: 'score',
      type: 'number',
      label: 'Score (%)',
      min: 0,
      max: 100,
      admin: {
        description: 'Score percentage (0-100).',
      },
    },
    {
      name: 'answers',
      type: 'json', // Store quiz answers as JSON
      label: 'Answers (Quiz)',
      admin: {
        description: 'Stores the user\'s answers for quizzes.',
        // Consider adding a custom component for better visualization if needed
      },
    },
    {
      name: 'files',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      label: 'Submitted Files (Assignment)',
      admin: {
        description: 'Files submitted for assignment type assessments.',
        // Condition based on assessment type might be complex here, handle in UI/endpoint
      },
    },
    {
      name: 'feedback',
      type: 'textarea',
      label: 'Feedback',
      admin: {
        description: 'Feedback provided by the instructor/grader.',
      },
    },
    {
      name: 'attemptNumber',
      type: 'number',
      label: 'Attempt Number',
      defaultValue: 1,
      admin: {
        readOnly: true, // Should be managed by submission logic
      },
    },
  ],
  timestamps: true,
}
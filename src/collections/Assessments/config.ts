import type { CollectionConfig } from 'payload'

export const Assessments: CollectionConfig = {
  slug: 'assessments',
  admin: {
    group: 'Learning Management',
    useAsTitle: 'title',
    description: 'Quizzes and assignments linked to lessons.',
  },
  labels: {
    singular: 'Assessment',
    plural: 'Assessments',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      options: [
        { label: 'Quiz', value: 'quiz' },
        { label: 'Assignment', value: 'assignment' },
      ],
      required: true,
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      label: 'Lesson',
      admin: {
        position: 'sidebar',
        description: 'The lesson this assessment belongs to.',
      },
    },
    // Restore the questions field
    {
      name: 'questions',
      type: 'array',
      label: 'Questions',
      minRows: 1,
      admin: {
        condition: (data) => data.type === 'quiz',
      },
      fields: [
        {
          name: 'questionText',
          type: 'textarea',
          label: 'Question Text',
          required: true,
        },
        {
          name: 'questionType',
          type: 'select',
          label: 'Question Type',
          options: [
            { label: 'Multiple Choice', value: 'mcq' },
            { label: 'Single Choice', value: 'scq' },
            { label: 'Text Input', value: 'text' },
          ],
          defaultValue: 'scq',
          required: true,
        },
        {
          name: 'options',
          type: 'array',
          label: 'Options',
          minRows: 2,
          admin: {
            condition: (data, siblingData) =>
              siblingData.questionType === 'mcq' || siblingData.questionType === 'scq',
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              label: 'Option Text',
              required: true,
            },
            {
              name: 'isCorrect',
              type: 'checkbox',
              label: 'Is Correct Answer?',
              defaultValue: false,
            },
          ],
        },
        {
          name: 'points',
          type: 'number',
          label: 'Points',
          defaultValue: 1,
        },
      ],
    },
    // End restore
    {
      name: 'passingScore',
      type: 'number',
      label: 'Passing Score (%)',
      min: 0,
      max: 100,
      defaultValue: 70,
      admin: {
        description: 'Minimum score required to pass (0-100).',
        position: 'sidebar',
      },
    },
    {
      name: 'submissionInstructions',
      type: 'richText',
      label: 'Submission Instructions',
      admin: {
        condition: (data) => data.type === 'assignment',
      },
    },
    {
      name: 'maxAttempts',
      type: 'number',
      label: 'Maximum Attempts',
      defaultValue: 0,
      admin: {
        description: 'Maximum number of attempts allowed (0 for unlimited).',
        position: 'sidebar',
      },
    },
  ],
}
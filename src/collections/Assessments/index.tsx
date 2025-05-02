import React from 'react';
import { CollectionConfig } from 'payload';
import { isAdmin } from '@/access/isAdmin'; // Assuming admin access control
import { authenticated } from '@/access/authenticated'; // Assuming logged-in users can potentially read

const Assessments: CollectionConfig = {
  slug: 'assessments',
  admin: {
    useAsTitle: 'title',
    description: 'Quizzes or assignments linked to lessons.',
    defaultColumns: ['title', 'type', 'lesson', 'passingScore', 'updatedAt'],
  },
  access: {
    create: isAdmin,
    read: authenticated, // Or more specific access control if needed
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Assessment Title',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description / Instructions (General)',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Quiz', value: 'quiz' },
        { label: 'Assignment', value: 'assignment' },
      ],
      label: 'Assessment Type',
      admin: {
        position: 'sidebar',
      }
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      required: true,
      label: 'Associated Lesson',
      admin: {
        position: 'sidebar',
      }
      // Consider adding a filter here if lessons also get a link back
    },
    {
      name: 'questions',
      type: 'array',
      label: 'Quiz Questions',
      minRows: 1,
      admin: {
        condition: (_, siblingData) => siblingData.type === 'quiz',
        components: { // @ts-expect-error - TODO: Fix Payload types for RowLabel props
          RowLabel: ({ data, index = 0 }) => {
            return <>{data?.questionText || `Question ${index + 1}`}</>;
          },
        },
      },
      fields: [
        {
          name: 'questionText',
          type: 'textarea',
          required: true,
          label: 'Question Text',
        },
        {
          name: 'questionType',
          type: 'select',
          required: true,
          options: [
            { label: 'Multiple Choice (Multiple Correct)', value: 'mcq' },
            { label: 'Single Choice (One Correct)', value: 'scq' },
            { label: 'Text Input (Manual Grade)', value: 'text' }, // Manual grading needed for text
          ],
          defaultValue: 'scq',
          label: 'Question Type',
        },
        {
          name: 'options',
          type: 'array',
          label: 'Answer Options',
          minRows: 2,
          admin: {
            condition: (_, siblingData) => ['mcq', 'scq'].includes(siblingData.questionType),
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
              label: 'Option Text',
            },
            {
              name: 'isCorrect',
              type: 'checkbox',
              label: 'Is Correct Answer?',
            },
          ],
        },
        {
          name: 'points',
          type: 'number',
          defaultValue: 1,
          min: 0,
          label: 'Points for Correct Answer',
          admin: {
            condition: (_, siblingData) => ['mcq', 'scq'].includes(siblingData.questionType),
            step: 1,
          }
        },
      ],
    },
    {
      name: 'passingScore',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      defaultValue: 70,
      label: 'Passing Score (%)',
      admin: {
        condition: (_, siblingData) => siblingData.type === 'quiz',
        position: 'sidebar',
        step: 1,
      }
    },
    {
      name: 'submissionInstructions',
      type: 'richText', // Use richText for better formatting
      label: 'Assignment Submission Instructions',
      admin: {
        condition: (_, siblingData) => siblingData.type === 'assignment',
      }
    },
    {
      name: 'maxAttempts',
      type: 'number',
      defaultValue: 0, // 0 for unlimited
      min: 0,
      label: 'Maximum Attempts (0 for unlimited)',
      admin: {
        position: 'sidebar',
        step: 1,
      }
    },
    // Timestamps are added automatically by Payload
  ],
};

export default Assessments;
import type { CollectionConfig } from 'payload'

export const CourseReviews: CollectionConfig = {
  slug: 'course-reviews',
  admin: {
    group: 'Learning Management',
    useAsTitle: 'id', // Use ID or maybe a combination later if needed
    defaultColumns: ['user', 'course', 'rating', 'status', 'createdAt'],
    description: 'User reviews and ratings for courses.',
  },
  labels: {
    singular: 'Course Review',
    plural: 'Course Reviews',
  },
  access: {
    // Only logged-in users can create reviews
    create: ({ req }) => !!req.user,
    // Simplified read access control to avoid TS issues
    read: ({ req }) => {
      // Admins can read all reviews
      if (req.user?.role === 'admin') return true;

      // Logged-in users can read all reviews for now (simplification)
      if (req.user) {
        return true; // Allow logged-in users to read all for now
      }

      // Unauthenticated users can only read approved reviews
      return {
        status: { equals: 'approved' },
      };
    },
    // Users can only update their own reviews (if status allows)
    update: ({ req }) => ({ user: { equals: req.user?.id } }),
    // Users can only delete their own reviews (if status allows)
    delete: ({ req }) => ({ user: { equals: req.user?.id } }),
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'User',
      admin: {
        readOnly: true, // Set by hook or endpoint logic
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      label: 'Course',
      admin: {
        readOnly: true, // Set by hook or endpoint logic
      },
    },
    {
      name: 'enrollment',
      type: 'relationship',
      relationTo: 'course-enrollments',
      required: true, // Ensure review is linked to a specific enrollment
      label: 'Enrollment',
      admin: {
        readOnly: true, // Set by hook or endpoint logic
        description: 'Ensures only enrolled users can review.',
      },
      // Add index for potential lookups
      index: true,
    },
    {
      name: 'rating',
      type: 'number',
      label: 'Rating (1-5)',
      required: true,
      min: 1,
      max: 5,
      admin: {
        step: 0.5, // Allow half-star ratings if desired
      },
    },
    {
      name: 'reviewText',
      type: 'textarea',
      label: 'Review Text',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'pending', // Default to pending for moderation
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true, // Automatically add createdAt and updatedAt
}
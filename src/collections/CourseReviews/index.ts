import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'

export const CourseReviews: CollectionConfig = {
  slug: 'course-reviews',
  admin: {
    useAsTitle: 'id', // Maybe link user+course later
    listSearchableFields: ['user', 'course'],
    defaultColumns: ['user', 'course', 'rating', 'status', 'createdAt'],
    group: 'Learning Management',
    description: 'User reviews and ratings for courses.',
  },
  access: {
    create: authenticated, // Logged-in users can create (enrollment check via hook)
    read: anyone,         // Reviews are public once approved
    update: isAdmin,      // Only admins manage status (pending, approved, rejected)
    delete: isAdmin,      // Only admins can delete reviews
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'User',
      admin: {
        readOnly: true, // Set programmatically on create
        position: 'sidebar',
      },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      label: 'Course',
      admin: {
        readOnly: true, // Set programmatically on create
      },
    },
    {
      name: 'enrollment',
      type: 'relationship',
      relationTo: 'course-enrollments',
      required: true, // Ensure review is linked to a specific enrollment
      label: 'Enrollment Reference',
      admin: {
        readOnly: true, // Set programmatically on create
        description: 'Reference to the enrollment, ensuring the user was enrolled.',
      },
      // We might add an index here later if needed for querying
      // index: true,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      label: 'Rating (1-5)',
      min: 1,
      max: 5,
      admin: {
        position: 'sidebar',
        step: 1,
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
      required: true,
      label: 'Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'pending',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true, // Adds createdAt and updatedAt
  // hooks: {
  //   beforeChange: [
  //     // TODO: Add hook to verify user is enrolled in the course before creating review
  //     // TODO: Add hook to prevent non-admins from changing status
  //   ],
  // },
}
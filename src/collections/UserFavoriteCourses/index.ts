import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrSelf } from '@/access/isAdminOrSelf'

// This collection mirrors the structure of UserFavorites for products
export const UserFavoriteCourses: CollectionConfig = {
  slug: 'user-favorite-courses',
  admin: {
    useAsTitle: 'user', // Display the user relationship
    defaultColumns: ['user', 'updatedAt'],
    group: 'Learning Management', // Keep with other course features
    description: 'Stores users\' favorite courses.',
    // Consider hiding from main nav unless direct management is needed
    hidden: true,
  },
  access: {
    // A user should only ever have one document in this collection
    create: isAdminOrSelf, // Allow user to create their initial favorites list
    read: isAdminOrSelf,   // User can read their own favorites, admin can read all
    update: isAdminOrSelf, // User can update their own favorites, admin can update any
    delete: isAdmin,       // Only admin can delete a user's entire favorite record
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true, // Each user should only have one document
      label: 'User',
      admin: {
        readOnly: true, // Cannot change the user once created
        position: 'sidebar',
      },
    },
    {
      name: 'courses',
      type: 'relationship',
      relationTo: 'courses',
      hasMany: true,
      label: 'Favorite Courses',
      admin: {
        description: 'List of courses marked as favorite by the user.',
      },
    },
  ],
  timestamps: true, // Adds createdAt and updatedAt
}
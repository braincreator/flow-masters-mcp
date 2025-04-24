import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const Leaderboard: CollectionConfig = {
  slug: 'leaderboard',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'xp', 'level', 'rank', 'updatedAt'],
    group: 'Learning Management',
    description: 'User leaderboard rankings',
  },
  access: {
    create: isAdmin,
    read: () => true, // Все могут видеть лидерборд
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'User in the leaderboard',
      },
    },
    {
      name: 'xp',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Total XP of the user',
      },
    },
    {
      name: 'level',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        description: 'Current level of the user',
      },
    },
    {
      name: 'rank',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        description: 'Current rank of the user in the leaderboard',
      },
    },
    {
      name: 'previousRank',
      type: 'number',
      min: 0,
      admin: {
        description: 'Previous rank of the user (0 means new entry)',
      },
    },
    {
      name: 'rankChange',
      type: 'number',
      admin: {
        description: 'Change in rank since last update (positive means improvement)',
      },
    },
    {
      name: 'achievements',
      type: 'number',
      min: 0,
      admin: {
        description: 'Number of achievements earned by the user',
      },
    },
    {
      name: 'coursesCompleted',
      type: 'number',
      min: 0,
      admin: {
        description: 'Number of courses completed by the user',
      },
    },
    {
      name: 'streak',
      type: 'number',
      min: 0,
      admin: {
        description: 'Current learning streak in days',
      },
    },
    {
      name: 'lastActive',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the user was last active',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for the leaderboard entry',
      },
    },
  ],
  timestamps: true,
}

import type { Access } from 'payload'
import type { User } from '../payload-types'

// Helper function to check for admin role
const checkUserIsAdmin = (user: any): boolean => {
  return Boolean(user?.roles?.includes('admin'))
}

export const isAdminOrAssignedUser: Access = ({ req }) => {
  const user = req.user

  // If there's no user, deny access
  if (!user) return false

  // If user is an admin, allow access
  if (checkUserIsAdmin(user)) return true

  // For other users, we'll let the collection handle specific conditions
  // Just return a simple filter for user association
  return {
    customer: {
      equals: user.id,
    },
  }
}
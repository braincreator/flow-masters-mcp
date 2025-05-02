import type { Access } from 'payload'
import type { PayloadRequest } from 'payload' // Import PayloadRequest
import type { User } from '../payload-types'

// Helper function to check for admin role in the roles array
const checkUserIsAdmin = (user: any): boolean => {
  // Check the 'roles' array which should exist on the user object
  return Boolean(user?.roles?.includes('admin'))
}

export const isAdmin: Access = ({ req }) => {
  // Directly use the helper function with req.user
  // req.user might be null or the user object
  return checkUserIsAdmin(req.user)
}

// New export specifically for CollectionConfig.access.admin
export const isAdminAccessCheck = ({ req }: { req: PayloadRequest }): boolean => {
  // Type assertion might be needed if req.user isn't guaranteed to be User type here
  return checkUserIsAdmin(req.user as User | undefined)
}

// Removed the redundant isAdminUser and checkIsAdminOrEditor functions
// If editor logic is needed, add an 'editor' role to Users and create a specific check function.

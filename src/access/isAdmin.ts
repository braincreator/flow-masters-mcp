import { Access } from 'payload'
import { User } from '../payload-types'

export const isAdmin: Access = ({ req: { user } }) => {
  // Check if there is a logged-in user
  if (!user) return false

  // Cast the user to the correct type
  const typedUser = user as User

  // Use the checkIsAdmin helper function
  return checkIsAdmin(typedUser)
}

// You can also use this function directly
export const checkIsAdmin = (user: any) => {
  // Check for role property which is used in the Users collection
  return Boolean(user?.role === 'admin')
}

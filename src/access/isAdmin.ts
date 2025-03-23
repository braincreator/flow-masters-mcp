import { Access } from 'payload'
import { User } from '../payload-types'

export const isAdmin: Access = ({ req: { user } }) => {
  // Check if there is a logged-in user
  if (!user) return false

  // Cast the user to the correct type
  const typedUser = user as User

  // Check if the user has the admin role
  return checkIsAdmin(typedUser)//Boolean(typedUser.roles?.includes('admin'))
}

// You can also use this function directly
export const checkIsAdmin = (user: any) => {
  return Boolean(user?.role === 'admin')
}

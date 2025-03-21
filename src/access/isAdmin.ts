import { Access } from 'payload/types'

export const isAdmin: Access = ({ req: { user } }) => {
  // Check if user exists and has admin role
  return Boolean(user?.role === 'admin')
}

// You can also use this function directly
export const checkIsAdmin = (user: any) => {
  return Boolean(user?.role === 'admin')
}
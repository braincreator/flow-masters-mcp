import { Access } from 'payload'
import { isAdmin } from './isAdmin'

/**
 * Access control function to check if user is admin or project customer
 * Used for collections related to service projects
 */
export const isAdminOrProjectCustomer: Access = ({ req: { user } }) => {
  if (!user) return false

  // Administrators have full access
  if (user.roles?.includes('admin')) return true

  // For regular users, only allow access to their own projects
  return {
    customer: {
      equals: user.id,
    },
  }
}

/**
 * Access control function for collections that have a relationship to projects
 * Checks if user is admin or the customer of the related project
 */
export const isAdminOrProjectCustomerRelated: Access = async ({ req, id, data }) => {
  const { user, payload } = req

  if (!user) return false

  // Administrators have full access
  if (user.roles?.includes('admin')) return true

  let projectId

  // For update or delete operations, get project from existing record
  if (id) {
    try {
      // We need to know the collection name, for now return false
      // In real implementation, this should be passed as parameter
      return false
    } catch (error) {
      return false
    }
  } else if (data?.project) {
    // For create operations, get project from submitted data
    projectId = data.project
  } else {
    return false
  }

  // Check if user is the customer of the project
  try {
    const project = await payload.findByID({
      collection: 'service-projects',
      id: projectId,
    })

    return (project as any).customer === user.id
  } catch (error) {
    return false
  }
}

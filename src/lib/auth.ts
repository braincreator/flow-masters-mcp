import { cookies } from 'next/headers'

/**
 * Gets the current user from Payload CMS
 * @returns The user object or null if not authenticated
 */
export async function getUser() {
  return (await getServerSession())?.user || null
}

/**
 * Gets the current user session from Payload CMS
 * @returns The user session object or null if not authenticated
 */
export async function getServerSession() {
  try {
    // Try to get the user from cookies
    let user = null

    try {
      // Get user from Payload using the cookie
      const cookieStore = await cookies()
      const token = cookieStore.get('payload-token')?.value

      if (!token) {
        return null
      }
      // Use the me endpoint to get the current user
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || ''}/api/users/me`, {
        cache: 'no-store',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `payload-token=${token}`,
        },
      })

      if (!response.ok) {
        return null
      }

      const { user: currentUser } = await response.json()

      user = currentUser
    } catch (error) {
      console.error('Error fetching user session:', error)
      return null
    }

    // If no user is found, return null
    if (!user || !user.id) {
      return null
    }

    // Add isAdmin flag based on roles
    if (user.roles && (user.roles.includes('admin') || user.roles.includes('super-admin'))) {
      user.isAdmin = true
    } else {
      user.isAdmin = false
    }

    return {
      user,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

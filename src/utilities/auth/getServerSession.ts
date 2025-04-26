/**
 * Re-export getServerSession from @/lib/auth to maintain compatibility
 * with both import paths:
 * - @/lib/auth
 * - @/utilities/auth/getServerSession
 */
export { getServerSession } from '@/lib/auth'

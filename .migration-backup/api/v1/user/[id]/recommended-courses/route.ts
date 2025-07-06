import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { verifyAuth } from '@/utilities/auth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Define User interface
interface User {
  id: string
  name: string
  email: string
  role?: string
  interests?: string[]
  [key: string]: unknown
}

// Define CourseEnrollment interface
interface CourseEnrollment {
  id: string
  user: string
  course: string
  status: string
  [key: string]: unknown
}

// Define Course interface
interface Course {
  id: string
  title: string
  slug: string
  description?: string
  rating?: number
  enrollmentCount?: number
  estimatedDuration?: string | number
  level?: string
  trending?: boolean
  createdAt: string
  featuredImage?: {
    url: string
    alt?: string
    [key: string]: unknown
  }
  tags?: string[]
  [key: string]: unknown
}

// Define PayloadResponse interface for consistent typing
interface PayloadResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify authentication using Payload CMS
    const auth = await verifyAuth(request)

    // Check if user is authenticated
    if (!auth.isAuthenticated || !auth.user) {
      return auth.response || NextResponse.json({
        success: false,
        error: 'Unauthorized',
        notification: {
          type: 'error',
          message: 'Please login to access this resource'
        }
      }, { status: 401 })
    }

    // In Next.js route handlers, params should be treated as a Promise
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Log for debugging authorization
    logDebug('Authorization Check Details for /user/[id]/recommended-courses:');
    logDebug('Path ID (id):', id, typeof id);
    logDebug('Authenticated User ID (auth.user?.id):', auth.user?.id, typeof auth.user?.id);
    logDebug('Is Admin (auth.user?.isAdmin):', auth.user?.isAdmin, typeof auth.user?.isAdmin);
    // logDebug('Authenticated User (auth.user):', JSON.stringify(auth.user, null, 2)); // Uncomment if full user object is needed

    // Check if user has access to this data
    // (only admin or the user themselves)
    if (auth.user.id !== id && !auth.user.isAdmin) {
      logWarn('Authorization failed in /user/[id]/recommended-courses: User is not the owner and not an admin.', {
        pathId: id,
        authUserId: auth.user.id,
        isAdmin: auth.user.isAdmin,
        authenticatedUser: auth.user, // Log the user object for more context
      });
    if (!auth.user || (auth.user.id !== id && !auth.user.roles?.includes('admin'))) {
      logWarn('Authorization failed in /user/[id]/recommended-courses:', {
        pathId: id,
        authUserId: auth.user?.id,
        userRoles: auth.user?.roles,
        isAdmin: auth.user?.isAdmin,
        authenticatedUser: auth.user,
      });
      
      let errorMessage = 'You do not have permission to access this resource';
      if (auth.user?.id !== id) {
        errorMessage += ' (not the resource owner)';
      }
      if (!auth.user?.roles?.includes('admin')) {
        errorMessage += ' (not an admin)';
      }

      return NextResponse.json({
        success: false,
        error: 'Forbidden',
        details: {
          required: 'Owner or admin access',
          userRoles: auth.user?.roles,
          isAdmin: auth.user?.isAdmin
        },
        notification: {
          type: 'error',
          message: errorMessage
        }
      }, { status: 403 })
    }
    }

    const userId = id
    const payload = await getPayloadClient()

    // Get query parameters
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '3')

    // Fetch user data to get interests and preferences
    const user = (await payload.findByID({
      collection: 'users',
      id: userId,
    })) as unknown as User

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        notification: {
          type: 'error',
          message: 'The requested user could not be found'
        }
      }, { status: 404 })
    }

    // Fetch courses the user is already enrolled in
    const enrollments = (await payload.find({
      collection: 'course-enrollments',
      where: {
        user: {
          equals: userId,
        },
      },
      depth: 0,
    })) as unknown as PayloadResponse<CourseEnrollment>

    // Get IDs of courses the user is already enrolled in
    const enrolledCourseIds = enrollments.docs.map((enrollment) => enrollment.course)

    // Fetch recommended courses based on user interests and not already enrolled
    // This is a simplified recommendation algorithm
    const recommendedCourses = (await payload.find({
      collection: 'courses',
      where: {
        and: [
          {
            id: {
              not_in: enrolledCourseIds,
            },
          },
          {
            status: {
              equals: 'published',
            },
          },
        ],
      },
      sort: '-createdAt', // Sort by newest first
      limit: limit * 2, // Fetch more than needed to have a selection
      depth: 1,
    })) as unknown as PayloadResponse<Course>

    // Transform courses to the expected format
    const formattedCourses = recommendedCourses.docs.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description || '',
      rating: course.rating || 4.5,
      students: course.enrollmentCount || 0,
      estimatedDuration: course.estimatedDuration || '', // Use correct field name and string fallback
      level: course.level || 'beginner',
      trending: course.trending || false,
      new: new Date(course.createdAt).getTime() > Date.now() - 14 * 24 * 60 * 60 * 1000, // If created in the last 14 days
      featuredImage: course.featuredImage
        ? {
            url: course.featuredImage.url,
            alt: course.featuredImage.alt || course.title,
          }
        : undefined,
      tags: course.tags || [],
    }))

    // Prioritize trending and new courses
    const trendingCourses = formattedCourses.filter((course) => course.trending)
    const newCourses = formattedCourses.filter((course) => course.new && !course.trending)
    const otherCourses = formattedCourses.filter((course) => !course.trending && !course.new)

    // Combine and limit to requested number
    const finalCourses = [...trendingCourses, ...newCourses, ...otherCourses].slice(0, limit)

    return NextResponse.json({
      success: true,
      data: finalCourses,
      notification: {
        type: 'success',
        message: 'Recommended courses loaded successfully'
      }
    })
  } catch (error) {
    logError('Error fetching recommended courses:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

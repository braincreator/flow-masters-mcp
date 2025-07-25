import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { verifyAuth } from '@/utilities/auth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Define interfaces for activity data
interface UserAchievement {
  id: string
  user: string
  achievement?: {
    id: string
    name: string
    courseId?: string
    [key: string]: unknown
  }
  createdAt: string
  [key: string]: unknown
}

interface CourseEnrollment {
  id: string
  user: string
  course?: {
    id: string
    title: string
    [key: string]: unknown
  }
  status: string
  enrolledAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

interface LessonProgress {
  id: string
  user: string
  lesson?: {
    id: string
    title: string
    module?: {
      course?: {
        id: string
        title: string
        [key: string]: unknown
      }
      [key: string]: unknown
    }
    [key: string]: unknown
  }
  completed: boolean
  updatedAt: string
  [key: string]: unknown
}

interface UserReward {
  id: string
  user: string
  reward?: {
    id: string
    name: string
    [key: string]: unknown
  }
  createdAt: string
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
  // Await the params object before using it
  const resolvedParams = await params;
  const { id } = resolvedParams;
  try {
    // Verify authentication using Payload CMS
    const auth = await verifyAuth(request)

    // Check if user is authenticated
    if (!auth.isAuthenticated || !auth.user) {
      logError('User activity API: Authentication failed', {
        error: auth.error,
        isAuthenticated: auth.isAuthenticated,
        hasUser: !!auth.user,
        userId: id,
        requestHeaders: Object.fromEntries(request.headers),
      })
      return (
        auth.response ||
        NextResponse.json({
          success: false,
          error: 'Unauthorized',
          details: auth.error,
          notification: {
            type: 'error',
            message: 'Please login to access this resource'
          }
        }, { status: 401 })
      )
    }

    // Log for debugging authorization
    logDebug('Authorization Check Details for /user/[id]/activity:');
    logDebug('Path ID (id):', id, typeof id);
    logDebug('Authenticated User ID (auth.user?.id):', auth.user?.id, typeof auth.user?.id);
    logDebug('Is Admin (auth.user?.isAdmin):', auth.user?.isAdmin, typeof auth.user?.isAdmin);
    // logDebug('Authenticated User (auth.user):', JSON.stringify(auth.user, null, 2)); // Uncomment if full user object is needed

    // Check if user has access to this data
    // (only admin or the user themselves)
    if (auth.user.id !== id && !auth.user.isAdmin) {
      logWarn('Authorization failed in /user/[id]/activity: User is not the owner and not an admin.', {
        pathId: id,
        authUserId: auth.user.id,
        isAdmin: auth.user.isAdmin,
        authenticatedUser: auth.user, // Log the user object for more context
      });
    if (!auth.user || (auth.user.id !== id && !auth.user.roles?.includes('admin'))) {
      logWarn('Authorization failed in /user/[id]/activity:', {
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

    // Get Payload client with better error handling
    let payload
    try {
      payload = await getPayloadClient()
      logDebug('Successfully connected to Payload client')
    } catch (dbError) {
      logError('Failed to connect to database:', dbError)
      return NextResponse.json(
        { success: false, error: 'Database connection error' },
        { status: 500 },
      )
    }

    // Get query parameters
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')

    // Initialize empty results for each collection
    let userAchievements: PayloadResponse<UserAchievement> | null = null
    let courseEnrollments: PayloadResponse<CourseEnrollment> | null = null
    let lessonProgress: PayloadResponse<LessonProgress> | null = null
    let userRewards: PayloadResponse<UserReward> | null = null

    // Fetch each collection separately with error handling
    try {
      logDebug('Fetching user achievements for user:', userId)
      userAchievements = (await payload.find({
        collection: 'user-achievements',
        where: {
          user: {
            equals: userId,
          },
        },
        sort: '-createdAt',
        limit: 20,
        depth: 1,
      })) as unknown as PayloadResponse<UserAchievement>
      logDebug(`Found ${userAchievements.docs.length} achievements`)
    } catch (error) {
      logError('Error fetching user achievements:', error)
      // Continue with empty achievements rather than failing completely
    }

    try {
      logDebug('Fetching course enrollments for user:', userId)
      courseEnrollments = (await payload.find({
        collection: 'course-enrollments',
        where: {
          user: {
            equals: userId,
          },
        },
        sort: '-createdAt',
        limit: 20,
        depth: 1,
      })) as unknown as PayloadResponse<CourseEnrollment>
      logDebug(`Found ${courseEnrollments.docs.length} course enrollments`)
    } catch (error) {
      logError('Error fetching course enrollments:', error)
      // Continue with empty enrollments
    }

    try {
      logDebug('Fetching lesson progress for user:', userId)
      lessonProgress = (await payload.find({
        collection: 'lesson-progress',
        where: {
          user: {
            equals: userId,
          },
          status: {
            equals: 'completed',
          },
        },
        sort: '-updatedAt',
        limit: 20,
        depth: 1,
      })) as unknown as PayloadResponse<LessonProgress>
      logDebug(`Found ${lessonProgress.docs.length} completed lessons`)
    } catch (error) {
      logError('Error fetching lesson progress:', error)
      // Continue with empty lesson progress
    }

    try {
      logDebug('Fetching user rewards for user:', userId)
      userRewards = (await payload.find({
        collection: 'user-rewards',
        where: {
          user: {
            equals: userId,
          },
        },
        sort: '-createdAt',
        limit: 20,
        depth: 1,
      })) as unknown as PayloadResponse<UserReward>
      logDebug(`Found ${userRewards.docs.length} rewards`)
    } catch (error) {
      logError('Error fetching user rewards:', error)
      // Continue with empty rewards
    }

    // Transform the data into a unified activity feed format with better error handling
    logDebug('Transforming activity data to unified format')

    // Helper function to safely map items with error handling
    const safeMap = <T>(items: T[], mapFn: (item: T) => any): any[] => {
      return items
        .map((item) => {
          try {
            return mapFn(item)
          } catch (error) {
            logError('Error mapping activity item:', error)
            return null
          }
        })
        .filter(Boolean) // Remove any null items from failed mappings
    }

    const activities = [
      // Map achievements to activity items
      ...safeMap(userAchievements?.docs || [], (item) => {
        if (!item || !item.id) return null

        return {
          id: item.id,
          type: 'achievement',
          title: 'earnedAchievement',
          description: item.achievement?.name || 'Achievement',
          timestamp: item.createdAt || new Date().toISOString(),
          meta: {
            achievementId: item.achievement?.id,
            achievementName: item.achievement?.name,
            courseId: item.achievement?.courseId,
          },
        }
      }),

      // Map course enrollments to activity items
      ...safeMap(courseEnrollments?.docs || [], (item) => {
        if (!item || !item.id) return null

        const timestamp =
          item.status === 'completed'
            ? item.completedAt || item.updatedAt || item.createdAt || new Date().toISOString()
            : item.enrolledAt || item.createdAt || new Date().toISOString()

        return {
          id: item.id,
          type: 'course_progress',
          title: item.status === 'completed' ? 'completedCourse' : 'startedCourse',
          description: item.course?.title || 'Course',
          timestamp,
          meta: {
            courseId: item.course?.id,
            courseName: item.course?.title,
          },
        }
      }),

      // Map lesson progress to activity items
      ...safeMap(lessonProgress?.docs || [], (item) => {
        if (!item || !item.id) return null

        return {
          id: item.id,
          type: 'course_progress',
          title: 'completedLesson',
          description: item.lesson?.title || 'Lesson',
          timestamp: item.updatedAt || item.createdAt || new Date().toISOString(),
          meta: {
            lessonId: item.lesson?.id,
            lessonName: item.lesson?.title,
            courseId: item.lesson?.module?.course?.id,
            courseName: item.lesson?.module?.course?.title,
          },
        }
      }),

      // Map user rewards to activity items
      ...safeMap(userRewards?.docs || [], (item) => {
        if (!item || !item.id) return null

        return {
          id: item.id,
          type: 'reward',
          title: 'claimedReward',
          description: item.reward?.name || 'Reward',
          timestamp: item.createdAt || new Date().toISOString(),
          meta: {
            rewardId: item.reward?.id,
            rewardName: item.reward?.name,
          },
        }
      }),
    ]

    logDebug(`Successfully transformed ${activities.length} activity items`)

    // Sort activities by timestamp (newest first) with error handling
    let sortedActivities = []
    try {
      logDebug('Sorting activities by timestamp')
      sortedActivities = activities.sort((a, b) => {
        try {
          const dateA = new Date(a.timestamp).getTime()
          const dateB = new Date(b.timestamp).getTime()
          return dateB - dateA
        } catch (error) {
          logError('Error comparing timestamps:', error)
          return 0 // Keep original order if comparison fails
        }
      })
    } catch (error) {
      logError('Error sorting activities:', error)
      sortedActivities = activities // Use unsorted activities if sorting fails
    }

    // Limit the number of activities
    logDebug(`Limiting to ${limit} activities`)
    const limitedActivities = sortedActivities.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: limitedActivities,
      notification: {
        type: 'success',
        message: 'Activity feed loaded successfully'
      }
    })
  } catch (error) {
    logError('Error fetching user activity:', error)

    // Provide more detailed error information
    let errorMessage = 'Unknown error'
    let errorDetails = {}

    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = {
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
        notification: {
          type: 'error',
          message: 'Failed to load activity feed'
        },
      },
      { status: 500 },
    )
  }
}

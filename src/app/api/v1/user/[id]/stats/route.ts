import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { verifyAuth } from '@/utilities/auth'

// Define extended User interface with additional properties
interface ExtendedUser {
  id: string
  name: string
  email: string
  role?: string
  level?: number
  xp?: number
  xpToNextLevel?: number
  streak?: number
  lastActive?: string
  [key: string]: unknown
}

// Define LessonProgress interface
interface LessonProgress {
  id: string
  user: string
  lesson: string
  completedAt?: string
  timeSpent?: number
  completed?: boolean
  [key: string]: unknown
}

// Define CourseEnrollment interface
interface CourseEnrollment {
  id: string
  user: string
  course: string
  status: 'enrolled' | 'in-progress' | 'completed' | 'expired'
  enrolledAt: string
  completedAt?: string
  [key: string]: unknown
}

// Define UserAchievement interface
interface UserAchievement {
  id: string
  user: string
  achievement: string
  earnedAt: string
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
      console.error('User stats API: Authentication failed', {
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
    console.log('Authorization Check Details for /user/[id]/stats:');
    console.log('Path ID (id):', id, typeof id);
    console.log('Authenticated User ID (auth.user?.id):', auth.user?.id, typeof auth.user?.id);
    console.log('Is Admin (auth.user?.isAdmin):', auth.user?.isAdmin, typeof auth.user?.isAdmin);
    // console.log('Authenticated User (auth.user):', JSON.stringify(auth.user, null, 2)); // Uncomment if full user object is needed

    // Check if user has access to this data
    // (only admin or the user themselves)
    if (auth.user.id !== id && !auth.user.roles?.includes('admin')) {
      console.warn('Authorization failed in /user/[id]/stats:', {
        pathId: id,
        authUserId: auth.user.id,
        userRoles: auth.user.roles,
        isAdmin: auth.user.isAdmin,
        authenticatedUser: auth.user,
      });
      
      let errorMessage = 'You do not have permission to access this resource';
      if (auth.user.id !== id) {
        errorMessage += ' (not the resource owner)';
      }
      if (!auth.user.roles?.includes('admin')) {
        errorMessage += ' (not an admin)';
      }

      return NextResponse.json({
        success: false,
        error: 'Forbidden',
        details: {
          required: 'Owner or admin access',
          userRoles: auth.user.roles,
          isAdmin: auth.user.isAdmin
        },
        notification: {
          type: 'error',
          message: errorMessage
        }
      }, { status: 403 })
    }

    const userId = id
    const payload = await getPayloadClient()

    // Fetch user data
    const user = (await payload.findByID({
      collection: 'users',
      id: userId,
    })) as unknown as ExtendedUser

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

    // Fetch course enrollments
    const courseEnrollments = (await payload.find({
      collection: 'course-enrollments',
      where: {
        user: {
          equals: userId,
        },
      },
      depth: 1,
    })) as unknown as PayloadResponse<CourseEnrollment>

    // Fetch lesson progress
    const lessonProgress = (await payload.find({
      collection: 'lesson-progress',
      where: {
        user: {
          equals: userId,
        },
      },
      depth: 1,
    })) as unknown as PayloadResponse<LessonProgress>

    // Fetch user achievements
    const userAchievements = (await payload.find({
      collection: 'user-achievements',
      where: {
        user: {
          equals: userId,
        },
      },
      depth: 1,
    })) as unknown as PayloadResponse<UserAchievement>

    // Calculate stats
    const totalCourses = courseEnrollments.totalDocs
    const completedCourses = courseEnrollments.docs.filter(
      (enrollment) => enrollment.status === 'completed',
    ).length

    const totalLessons = lessonProgress.totalDocs
    const completedLessons = lessonProgress.docs.filter((progress) => progress.completed).length

    // Calculate total time spent (in minutes)
    const totalTime = lessonProgress.docs.reduce(
      (total, lesson) => total + (lesson.timeSpent || 0),
      0,
    )

    // Get user level and XP from user data
    const level = user.level || 1
    const xp = user.xp || 0
    const xpToNextLevel = user.xpToNextLevel || 1000

    // Get streak from user data
    const streak = user.streak || 0
    const lastActive = user.lastActive || new Date().toISOString()

    // Get achievements
    const achievements = userAchievements.totalDocs
    const totalAchievements = 30 // This should be fetched from a configuration or calculated

    return NextResponse.json({
      success: true,
      data: {
        totalCourses,
        completedCourses,
        totalLessons,
        completedLessons,
        totalTime,
        streak,
        lastActive,
        level,
        xp,
        xpToNextLevel,
        achievements,
        totalAchievements,
      },
      notification: {
        type: 'success',
        message: 'User stats loaded successfully'
      }
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        notification: {
          type: 'error',
          message: 'Failed to load user stats'
        },
      },
      { status: 500 },
    )
  }
}

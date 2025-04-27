import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { verifyAuth } from '@/utilities/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication using Payload CMS
    const auth = await verifyAuth(request)

    // Check if user is authenticated
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this data
    // (only admin or the user themselves)
    if (auth.user.id !== params.id && !auth.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = params.id
    const payload = await getPayloadClient()

    // Get query parameters
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')

    // Fetch user activities from various sources
    const [userAchievements, courseEnrollments, lessonProgress, userRewards] = await Promise.all([
      // Get user achievements
      payload.find({
        collection: 'user-achievements',
        where: {
          user: {
            equals: userId,
          },
        },
        sort: '-createdAt',
        limit: 20,
        depth: 1, // Include achievement details
      }),

      // Get course enrollments
      payload.find({
        collection: 'course-enrollments',
        where: {
          user: {
            equals: userId,
          },
        },
        sort: '-createdAt',
        limit: 20,
        depth: 1, // Include course details
      }),

      // Get lesson progress
      payload.find({
        collection: 'lesson-progress',
        where: {
          user: {
            equals: userId,
          },
          completed: {
            equals: true,
          },
        },
        sort: '-updatedAt',
        limit: 20,
        depth: 1, // Include lesson details
      }),

      // Get user rewards
      payload.find({
        collection: 'user-rewards',
        where: {
          user: {
            equals: userId,
          },
        },
        sort: '-createdAt',
        limit: 20,
        depth: 1, // Include reward details
      }),
    ])

    // Transform the data into a unified activity feed format
    const activities = [
      // Map achievements to activity items
      ...userAchievements.docs.map((item) => ({
        id: item.id,
        type: 'achievement',
        title: 'earnedAchievement',
        description: item.achievement?.name || 'Achievement',
        timestamp: item.createdAt,
        meta: {
          achievementId: item.achievement?.id,
          achievementName: item.achievement?.name,
          courseId: item.achievement?.courseId,
        },
      })),

      // Map course enrollments to activity items
      ...courseEnrollments.docs.map((item) => ({
        id: item.id,
        type: 'course_progress',
        title: item.status === 'completed' ? 'completedCourse' : 'startedCourse',
        description: item.course?.title || 'Course',
        timestamp:
          item.status === 'completed'
            ? item.completedAt || item.updatedAt
            : item.enrolledAt || item.createdAt,
        meta: {
          courseId: item.course?.id,
          courseName: item.course?.title,
        },
      })),

      // Map lesson progress to activity items
      ...lessonProgress.docs.map((item) => ({
        id: item.id,
        type: 'course_progress',
        title: 'completedLesson',
        description: item.lesson?.title || 'Lesson',
        timestamp: item.updatedAt,
        meta: {
          lessonId: item.lesson?.id,
          lessonName: item.lesson?.title,
          courseId: item.lesson?.module?.course?.id,
          courseName: item.lesson?.module?.course?.title,
        },
      })),

      // Map user rewards to activity items
      ...userRewards.docs.map((item) => ({
        id: item.id,
        type: 'reward',
        title: 'claimedReward',
        description: item.reward?.name || 'Reward',
        timestamp: item.createdAt,
        meta: {
          rewardId: item.reward?.id,
          rewardName: item.reward?.name,
        },
      })),
    ]

    // Sort activities by timestamp (newest first)
    const sortedActivities = activities.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      return dateB - dateA
    })

    // Limit the number of activities
    const limitedActivities = sortedActivities.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: limitedActivities,
    })
  } catch (error) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

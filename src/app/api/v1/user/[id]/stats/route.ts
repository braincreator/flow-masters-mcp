import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { verifyAuth } from '@/utilities/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication using Payload CMS
    const auth = await verifyAuth(request)
    
    // Check if user is authenticated
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if user has access to this data
    // (only admin or the user themselves)
    if (auth.user.id !== params.id && !auth.user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    const userId = params.id
    const payload = await getPayloadClient()
    
    // Fetch user data
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Fetch course enrollments
    const courseEnrollments = await payload.find({
      collection: 'course-enrollments',
      where: {
        user: {
          equals: userId,
        },
      },
      depth: 1,
    })
    
    // Fetch lesson progress
    const lessonProgress = await payload.find({
      collection: 'lesson-progress',
      where: {
        user: {
          equals: userId,
        },
      },
      depth: 1,
    })
    
    // Fetch user achievements
    const userAchievements = await payload.find({
      collection: 'user-achievements',
      where: {
        user: {
          equals: userId,
        },
      },
      depth: 1,
    })
    
    // Calculate stats
    const totalCourses = courseEnrollments.totalDocs
    const completedCourses = courseEnrollments.docs.filter(
      (enrollment) => enrollment.status === 'completed'
    ).length
    
    const totalLessons = lessonProgress.totalDocs
    const completedLessons = lessonProgress.docs.filter(
      (progress) => progress.completed
    ).length
    
    // Calculate total time spent (in minutes)
    const totalTime = lessonProgress.docs.reduce(
      (total, lesson) => total + (lesson.timeSpent || 0),
      0
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
    })
    
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

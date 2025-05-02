import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { verifyAuth } from '@/utilities/auth'

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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication using Payload CMS
    const auth = await verifyAuth(request)

    // Check if user is authenticated
    if (!auth.isAuthenticated || !auth.user) {
      return auth.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In Next.js route handlers, params should be treated as a Promise
    const { id } = await params

    // Check if user has access to this data
    // (only admin or the user themselves)
    if (auth.user.id !== id && !auth.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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
    })
  } catch (error) {
    console.error('Error fetching recommended courses:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

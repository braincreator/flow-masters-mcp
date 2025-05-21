'use client'

import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
// Assuming useAuth hook exists and provides user information
// import { useAuth } from '@/hooks/useAuth' // Path to your auth hook
import { PageHeading } from '@/components/PageHeading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '../../../../../payload.config' // Adjusted path
import type { Course, User, CourseEnrollment } from '@/payload-types'

// Define a more specific type for the populated course within an enrollment
interface PopulatedCourseEnrollment extends Omit<CourseEnrollment, 'course'> {
  course: Course
}

const MyCoursesPage = () => {
  const t = useTranslations('Account.MyCourses')
  // const { user, isLoading: authLoading } = useAuth(); // Ideal: Get user from auth hook
  const [user, setUser] = useState<User | null>(null) // Placeholder for auth state
  const [authLoading, setAuthLoading] = useState(true) // Placeholder for auth loading state

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate fetching user for now - replace with actual useAuth()
    const simulateAuth = async () => {
      setAuthLoading(true)
      // Simulate a delay for auth check
      await new Promise(resolve => setTimeout(resolve, 500))
      // In a real app, useAuth() would provide the user object.
      // For now, we'll mock one if no real auth hook is integrated yet.
      const mockUser: User = {
        id: 'mock-user-id',
        name: 'Mock User', // Added name
        email: 'test@example.com',
        roles: ['customer'], // Added roles
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add any other required fields from your User type if necessary
      }
      setUser(mockUser) // Set the mock user
      setAuthLoading(false)
    }
    simulateAuth()
  }, [])

  useEffect(() => {
    if (authLoading || !user) {
      // Don't fetch courses if auth is loading or user is not available
      if (!authLoading && !user) {
        setIsLoadingData(false) // Stop loading if auth is done and no user
      }
      return
    }

    const fetchEnrolledCourses = async () => {
      setIsLoadingData(true)
      setError(null)
      try {
        const payload = await getPayloadHMR({ config: configPromise })
        const enrollmentsResponse = await payload.find({
          collection: 'course-enrollments',
          where: {
            user: {
              equals: user.id,
            },
            // Optionally, filter by status, e.g.,
            // status: {
            //   equals: 'active',
            // },
          },
          depth: 2, // Ensures the 'course' field is populated
        })

        if (enrollmentsResponse.docs && enrollmentsResponse.docs.length > 0) {
          const courses = enrollmentsResponse.docs
            .map(enrollment => {
              // Type guard to ensure enrollment.course is a populated Course object
              if (typeof enrollment.course === 'object' && enrollment.course !== null && 'id' in enrollment.course) {
                return enrollment.course as Course
              }
              return null
            })
            .filter((course): course is Course => course !== null) // Type predicate to filter out nulls and satisfy TS
          setEnrolledCourses(courses)
        } else {
          setEnrolledCourses([])
        }
      } catch (err) {
        console.error('Error fetching enrolled courses:', err)
        setError(t('errorFetchingCourses'))
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchEnrolledCourses()
  }, [user, authLoading, t])

  if (authLoading || isLoadingData) {
    return <div className="container mx-auto py-8 text-center">{t('loading')}</div>
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle>{t('errorTitle')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertTitle>{t('accessDeniedTitle')}</AlertTitle>
          <AlertDescription>{t('authenticationRequiredMessage')}</AlertDescription>
          <Link href="/login" className="mt-2 inline-block font-medium text-blue-600 hover:underline">
            {t('loginLink')}
          </Link>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeading title={t('title')} description={t('description')} />

      {enrolledCourses.length === 0 ? (
        <Alert className="mt-6">
          <AlertTitle>{t('noCoursesTitle')}</AlertTitle>
          <AlertDescription>{t('noCoursesMessage')}</AlertDescription>
          <Link href="/courses" className="mt-2 inline-block font-medium text-blue-600 hover:underline">
            {t('browseCoursesLink')}
          </Link>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {enrolledCourses.map(course => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {course.excerpt || t('noDescription')}
                </p>
                <Link
                  href={`/courses/${course.slug}`} // Assumes course pages are at /courses/[slug]
                  className="font-medium text-blue-600 hover:underline"
                >
                  {t('viewCourseLink')}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyCoursesPage
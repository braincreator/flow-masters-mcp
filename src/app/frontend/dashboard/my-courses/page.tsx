'use client'; // Convert to Client Component

import React, { useState, useEffect, useCallback } from 'react';
import { redirect } from 'next/navigation';
import { useTranslations } from 'next-intl'; // Use client hook
import { CourseEnrollment, User, Course } from '@/payload-types';
import { Locale } from '@/constants';
import { api, getCurrentUser } from '@/lib/api-client';
import CourseCard from '@/components/courses/CourseCard'; // Reusing CourseCard
import { GridContainer } from '@/components/GridContainer'; // Assuming GridContainer exists
import { Link } from '@/components/ui/link'; // Use base Link for custom links
import { Button } from '@/components/ui/button'; // For potential actions

// Define a type for the paginated Payload response
interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface MyCoursesPageProps {
  params: {
    locale: Locale;
  };
}

async function fetchUserEnrollments(userId: string, locale: Locale): Promise<PayloadResponse<CourseEnrollment>> {
  try {
    const enrollmentsData = await api.get<PayloadResponse<CourseEnrollment>>('/course-enrollments', {
      where: {
        user: { equals: userId },
        // Optionally filter by status: { equals: 'active' }
      },
      locale: locale, // Pass locale for course details
      depth: 2, // Depth 2 to populate course -> featuredImage
      limit: 50, // Adjust limit as needed
      sort: '-enrolledAt', // Show most recent first
    });
    return enrollmentsData;
  } catch (error) {
    console.error('Failed to fetch user enrollments:', error);
    // Return empty state matching PayloadResponse structure
    return { docs: [], totalDocs: 0, limit: 50, totalPages: 0, page: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null, pagingCounter: 0 };
  }
}

// Helper to check if course is populated within enrollment
const isCoursePopulated = (course: Course | string | undefined | null): course is Course => {
  return typeof course === 'object' && course !== null;
};


const MyCoursesPage: React.FC<MyCoursesPageProps> = ({ params: { locale } }) => {
  const t = useTranslations('MyCoursesPage');
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelState, setCancelState] = useState<{ [key: string]: { loading: boolean; error: string | null } }>({});

  // Fetch user and enrollments
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedUser = await getCurrentUser();
      if (!fetchedUser) {
        // Redirect logic needs to be handled differently in client components
        // For now, just set user to null and handle in render
        setUser(null);
        setIsLoading(false);
        // Consider using next/router for client-side redirect if needed
        // import { useRouter } from 'next/navigation'; const router = useRouter(); router.push(...)
        return;
      }
      setUser(fetchedUser);
      const enrollmentsData = await fetchUserEnrollments(fetchedUser.id, locale);
      setEnrollments(enrollmentsData.docs);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(t('fetchError'));
    } finally {
      setIsLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cancellation Handler
  const handleCancelEnrollment = async (enrollmentId: string) => {
    // Optional: Add confirmation dialog
    // if (!confirm(t('cancelConfirmation'))) {
    //   return;
    // }

    setCancelState(prev => ({ ...prev, [enrollmentId]: { loading: true, error: null } }));

    try {
      await api.post(`/enrollments/${enrollmentId}/cancel`, {}); // Send POST request
      // Refresh data or update state locally
      setEnrollments(prev => prev.filter(e => e.id !== enrollmentId)); // Remove cancelled enrollment
      // Optionally show a success toast/message
    } catch (err: any) {
      console.error(`Failed to cancel enrollment ${enrollmentId}:`, err);
      const message = err?.response?.data?.message || t('cancelError');
      setCancelState(prev => ({ ...prev, [enrollmentId]: { loading: false, error: message } }));
    } finally {
      // Don't reset loading immediately if removing from list
      // setCancelState(prev => ({ ...prev, [enrollmentId]: { ...prev[enrollmentId], loading: false } }));
    }
  };

  // Handle redirect case for client component
  if (!isLoading && !user) {
     // You might want to show a login prompt or redirect using useRouter
     // For simplicity, just showing a message for now
     return <div className="container mx-auto px-4 py-8 text-center">{t('pleaseLogin')}</div>;
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">{t('loading')}</div>;
  }

  if (error) {
     return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      {enrollments.length === 0 ? (
        <div className="text-center py-10">
          <p className="mb-4">{t('noCoursesEnrolled')}</p>
          <Button asChild variant="default"> {/* Changed variant to default */}
            <Link href={`/${locale}/courses`}>{t('browseCourses')}</Link>
          </Button>
        </div>
      ) : (
        <GridContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => {
            if (!isCoursePopulated(enrollment.course)) {
              // Skip rendering if course data is missing (shouldn't happen with depth=2)
              console.warn(`Course data missing for enrollment ${enrollment.id}`);
              return null;
            }
            const course = enrollment.course;
            // TODO: Determine the actual first/next lesson ID to link to
            const learnUrl = `/${locale}/dashboard/my-courses/${enrollment.id}/learn`; // Placeholder link

            return (
              // We can wrap CourseCard or create a new component to add progress/actions
              <div key={enrollment.id} className="relative">
                <CourseCard course={course} locale={locale} />
                {/* Overlay or footer with progress and link to continue */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                  {/* Basic Progress Placeholder */}
                  <div className="text-xs text-white mb-1">Progress: {enrollment.progress || 0}%</div>
                  {/* Add status display */}
                  <div className="text-xs text-white mb-2">Status: {t(enrollment.status)}</div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-grow">
                      <Link href={learnUrl}>
                        {enrollment.progress && enrollment.progress > 0 ? t('continueLearning') : t('startLearning')}
                      </Link>
                    </Button>
                    {/* Add Cancel Button */}
                    {enrollment.status === 'active' && ( // Only show for active enrollments
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelEnrollment(enrollment.id)}
                        disabled={cancelState[enrollment.id]?.loading}
                        className="flex-shrink-0"
                      >
                        {cancelState[enrollment.id]?.loading ? t('cancelling') : t('cancel')}
                      </Button>
                    )}
                  </div>
                  {/* Display cancellation error */}
                  {cancelState[enrollment.id]?.error && (
                    <p className="text-xs text-red-400 mt-1">{cancelState[enrollment.id]?.error}</p>
                  )}
                </div>
              </div>
            );
          })}
        </GridContainer>
      )}
    </div>
  );
};

export default MyCoursesPage;
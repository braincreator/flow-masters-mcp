import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Lesson, CourseEnrollment, User, Course } from '@/payload-types';
import { Locale } from '@/constants';
import { api, getCurrentUser } from '@/lib/api-client';
import LessonContentDisplay from '@/components/courses/LessonContentDisplay';
// import MarkCompleteButton from '@/components/courses/MarkCompleteButton'; // Placeholder
// import LessonNavigation from '@/components/courses/LessonNavigation'; // Placeholder

interface LessonPageProps {
  params: {
    enrollmentId: string;
    lessonId: string;
    locale: Locale;
  };
}

// Define types for API responses
interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  // ... other fields
}

async function fetchLessonData(lessonId: string, locale: Locale): Promise<Lesson | null> {
  try {
    // Fetch lesson with depth 1 to get layout blocks
    const lesson = await api.get<Lesson>(`/lessons/${lessonId}`, { locale, depth: 1 });
    return lesson;
  } catch (error) {
    console.error(`Failed to fetch lesson ${lessonId}:`, error);
    return null;
  }
}

async function fetchEnrollmentData(enrollmentId: string): Promise<CourseEnrollment | null> {
  try {
    // Fetch enrollment with depth 1 to get related course info potentially
    const enrollment = await api.get<CourseEnrollment>(`/course-enrollments/${enrollmentId}`, { depth: 1 });
    return enrollment;
  } catch (error) {
    console.error(`Failed to fetch enrollment ${enrollmentId}:`, error);
    return null;
  }
}

const LessonPage: React.FC<LessonPageProps> = async ({ params: { enrollmentId, lessonId, locale } }) => {
  const t = await getTranslations({ locale, namespace: 'LessonPage' });

  // Fetch user, enrollment, and lesson data concurrently
  const [user, enrollment, lesson] = await Promise.all([
    getCurrentUser().catch(() => null),
    fetchEnrollmentData(enrollmentId),
    fetchLessonData(lessonId, locale),
  ]);

  // --- Access Control ---
  if (!user) {
    // Redirect to login if not authenticated
    const redirectPath = `/dashboard/my-courses/${enrollmentId}/learn/${lessonId}`;
    redirect(`/${locale}/login?redirect=${encodeURIComponent(redirectPath)}`);
  }

  if (!enrollment || !lesson) {
    notFound(); // Enrollment or Lesson not found
  }

  // Verify the enrollment belongs to the current user
  if (typeof enrollment.user === 'string' ? enrollment.user !== user.id : enrollment.user.id !== user.id) {
     console.warn(`User ${user.id} attempted to access enrollment ${enrollmentId} belonging to ${typeof enrollment.user === 'string' ? enrollment.user : enrollment.user.id}`);
     notFound(); // Or show an access denied message
  }

   // Verify the lesson belongs to the course in the enrollment
   const enrolledCourseId = typeof enrollment.course === 'string' ? enrollment.course : enrollment.course.id;
   // const lessonCourseId = typeof lesson.course === 'string' ? lesson.course : lesson.course?.id; // Property 'course' does not exist on type 'Lesson'.
   // TODO: Need a reliable way to check lesson belongs to enrolled course.
   // Fetch lesson.module (if populated) and check module.course? Requires updated types.
   // Commenting out check for now due to outdated types.
   // if (enrolledCourseId !== lessonModuleCourseId) {
   //    console.warn(`Lesson ${lessonId} does not belong to enrolled course ${enrolledCourseId}`);
   //    notFound();
   // }

  // TODO: Add prerequisite checks here based on enrollment progress and lesson.prerequisites

  // --- Render Page ---
  // Use 'any' type assertion for layout due to outdated Lesson type
  const lessonLayout = (lesson as any).layout as any[] | undefined | null;

  return (
    <div className="flex h-full"> {/* Consider layout with sidebar */}
      {/* Placeholder for Course Sidebar/Navigation */}
      <aside className="w-1/4 p-4 border-r hidden md:block">
        <h2 className="font-semibold mb-4">{typeof enrollment.course === 'object' ? enrollment.course.title : 'Course'} Navigation</h2>
        {/* <ModuleLessonList modules={course.modules} ... /> */}
        [Course Navigation Sidebar Placeholder]
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <header className="mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          {/* Add breadcrumbs or module context if available */}
        </header>

        <LessonContentDisplay layout={lessonLayout} />

        <footer className="mt-8 pt-4 border-t flex justify-between items-center">
          {/* Placeholder for Previous/Next Lesson Buttons */}
          {/* <LessonNavigation currentLesson={lesson} enrollment={enrollment} /> */}
          <div>[Prev/Next Lesson Buttons Placeholder]</div>

          {/* Placeholder for Mark Complete Button */}
          {/* <MarkCompleteButton lessonId={lesson.id} enrollmentId={enrollment.id} completionCriteria={lesson.completionCriteria} /> */}
          <div>[Mark Complete Button Placeholder]</div>
        </footer>
      </main>
    </div>
  );
};

export default LessonPage;
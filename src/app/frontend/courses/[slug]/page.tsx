import React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Course, Media, User, Module, CourseReview, CourseEnrollment } from '@/payload-types'; // Add CourseEnrollment
import { Locale } from '@/constants';
import { api, getCurrentUser } from '@/lib/api-client'; // Import getCurrentUser
import { Image } from '@/components/Image';
import ModuleLessonList from '@/components/courses/ModuleLessonList'; // Import ModuleLessonList
import EnrollmentButton from '@/components/courses/EnrollmentButton'; // Import EnrollmentButton
import ReviewForm from '@/components/courses/ReviewForm'; // Import ReviewForm
// import RichText from '@/components/RichText'; // Placeholder for rendering blocks

// Define a type for the paginated Payload response
interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  // ... other pagination fields if needed
}

// Type for average rating response
interface AverageRatingResponse {
  average: number;
  count: number;
}

interface CoursePageProps {
  params: {
    slug: string;
    locale: Locale;
  };
}

async function fetchCourseBySlug(slug: string, locale: Locale): Promise<Course | null> {
  try {
    const response = await api.get<PayloadResponse<Course>>('/courses', {
      where: {
        slug: { equals: slug },
        // status: { equals: 'published' }, // Optional: Ensure only published are accessible
      },
      locale: locale,
      depth: 1, // Keep depth 1 for direct fields like featuredImage
      limit: 1,
    });
    return response.docs[0] ?? null; // Return first doc or null
  } catch (error) {
    console.error(`Failed to fetch course with slug ${slug}:`, error);
    return null;
  }
}

const CourseDetailPage: React.FC<CoursePageProps> = async ({ params: { slug, locale } }) => {
  const t = await getTranslations({ locale, namespace: 'CoursePage' });

  // Fetch course and user first
  const [course, user] = await Promise.all([
    fetchCourseBySlug(slug, locale),
    getCurrentUser().catch(() => null) // Fetch user, default to null if not logged in or error
  ]);

  if (!course) {
    notFound(); // Show 404 if course not found
  }

  // Fetch reviews, rating, modules, and enrollment status now that we have the course ID and user
  const [avgRatingData, reviewsData, modulesData, enrollmentData] = await Promise.all([
    api.get<AverageRatingResponse>(`/courses/${course.id}/average-rating`).catch(() => ({ average: 0, count: 0 })),
    api.get<PayloadResponse<CourseReview>>(`/courses/${course.id}/reviews`, { page: 1, limit: 5, depth: 1 }).catch(() => ({ docs: [], totalDocs: 0, limit: 5, totalPages: 0, page: 1, hasNextPage: false })),
    api.get<PayloadResponse<Module>>('/modules', { // Fetch modules
      where: { course: { equals: course.id } },
      locale: locale,
      depth: 1, // Fetch lessons within modules
      sort: 'order', // Assuming an 'order' field exists on modules
      limit: 100, // Fetch all modules for the course
    }).catch(() => ({ docs: [] })), // Handle potential errors
    // Fetch enrollment status if user is logged in
    user ? api.get<PayloadResponse<CourseEnrollment>>('/course-enrollments', {
      where: {
        and: [
          { user: { equals: user.id } },
          { course: { equals: course.id } },
          { status: { equals: 'active' } } // Only allow reviews for active enrollments? Or 'completed' too? Let's allow active for now.
        ]
      },
      limit: 1,
      depth: 0,
    }).catch(() => ({ docs: [] })) : Promise.resolve({ docs: [] }),
  ]);
  const modules = modulesData.docs; // Extract modules from the response
  const enrollment = enrollmentData.docs[0] ?? null; // Get the first enrollment record or null


  const featuredImage = course.featuredImage as Media | undefined;
  const imageUrl = featuredImage?.url || '/placeholder-image.jpg';
  const imageAlt = featuredImage?.alt || t('courseImageAlt', { title: course.title });

  return (
    <div className="container mx-auto px-4 py-8">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          {course.excerpt && (
            <p className="text-lg text-muted-foreground mb-4">{course.excerpt}</p>
          )}
          <div className="relative mb-6">
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={1200}
              height={675}
              className="w-full h-auto object-cover rounded-lg shadow-md"
            />
          </div>
          <div className="flex justify-between items-center">
            {/* Placeholder for Author, Difficulty, Duration etc. */}
            <div className="text-sm text-muted-foreground">
              {/* By {course.author?.name} | {course.difficulty} | Est. {course.estimatedDuration} */}
            </div>
            <div>
              {/* Integrate Enrollment Button */}
              <EnrollmentButton course={course} user={user} locale={locale} />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <main className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">{t('courseContentTitle')}</h2>
            {/* Render course.layout blocks if they exist */}
            {/* {course.layout && <RichText content={course.layout} />} */}
            <div className="prose max-w-none">
              [Course Description / Layout Blocks Placeholder]
            </div>
          </main>

          <aside className="md:col-span-1">
            <h3 className="text-xl font-semibold mb-4">{t('modulesAndLessonsTitle')}</h3>
            {/* Integrate Module Lesson List */}
            <ModuleLessonList
              modules={modules} // Pass fetched modules
              locale={locale}
              courseSlug={slug}
            />
          </aside>
        </div>

        {/* Reviews Section */}
        <section className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-6">{t('reviewsTitle')}</h2>
          {avgRatingData && avgRatingData.count > 0 && (
            <div className="mb-6">
              <p className="text-lg">
                {t('averageRating')}: {avgRatingData.average.toFixed(1)} / 5 ({t('reviewCount', { count: avgRatingData.count })})
              </p>
              {/* Placeholder for Star Rating Display Component */}
              {/* <StarRating rating={avgRatingData.average} /> */}
            </div>
          )}

          {reviewsData && reviewsData.docs.length > 0 ? (
            <div className="space-y-6">
              {reviewsData.docs.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center mb-2">
                    {/* Placeholder for Star Rating Display Component */}
                    {/* <StarRating rating={review.rating} size="small" /> */}
                    <span className="font-semibold ml-2">{review.rating} / 5</span>
                    <span className="text-muted-foreground ml-4">
                      - {review.user && typeof review.user === 'object' ? review.user.name : t('anonymousUser')}
                    </span>
                    <span className="text-muted-foreground ml-2 text-sm">
                      ({new Date(review.createdAt).toLocaleDateString(locale)})
                    </span>
                  </div>
                  {review.reviewText && <p className="text-muted-foreground">{review.reviewText}</p>}
                </div>
              ))}
              {/* Basic Review Pagination (Needs client-side state if interactive) */}
              {reviewsData.totalPages > 1 && (
                 <div className="mt-4 text-center text-sm text-muted-foreground">
                   {t('page', { current: reviewsData.page, total: reviewsData.totalPages })}
                   {/* Add links/buttons for interactive pagination later */}
                 </div>
              )}
            </div>
          ) : (
            <p>{t('noReviewsYet')}</p>
          )}

          {/* Conditionally render Review Form */}
          {user && enrollment && (
            <div className="mt-8">
              <ReviewForm courseId={course.id} enrollmentId={enrollment.id} />
              {/* We could add an onReviewSubmitted handler here to potentially refresh reviews */}
            </div>
          )}
          {/* TODO: Add logic to check if user has *already* reviewed this enrollment and hide form */}

        </section>
      </article>
    </div>
  );
};

export default CourseDetailPage;

// Optional: Generate static paths
// export async function generateStaticParams({ params: { locale } }: { params: { locale: Locale } }) {
//   try {
//     const courses = await api.get<PayloadResponse<Course>>('/courses', {
//       where: { status: { equals: 'published' } },
//       locale: locale,
//       limit: 100,
//       select: 'slug',
//     });
//     return courses.docs.map(({ slug }) => ({ slug }));
//   } catch (error) {
//     console.error('Failed to generate static params for courses:', error);
//     return [];
//   }
// }
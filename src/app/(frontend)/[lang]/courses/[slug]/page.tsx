import React from 'react';
import { notFound } from 'next/navigation';
import { getPayloadClient } from '@/utilities/payload/index'; // Assuming this path is correct
import type { Course, Review, User } from '@/payload-types'; // Assuming this path is correct
// import type { Block } from '@/types/blocks'; // Removed unused import
// import { RenderBlocks } from '@/blocks/RenderBlocks'; // Removed unused import
import { CourseHero } from '@/components/CourseHero'; // Placeholder for CourseHero component
import { CourseReviews } from '@/components/CourseReviews'; // Import the new component
import CourseCurriculum from '@/components/CourseCurriculum'; // Import the curriculum component
import CourseInstructor from '@/components/CourseInstructor'; // Import the instructor component
import CoursePricing from '@/components/CoursePricing'; // Import the pricing component
import CourseOutcomes from '@/components/CourseOutcomes'; // Import the outcomes component
import CourseDetails from '@/components/CourseDetails'; // Import the details component
import { Locale } from '@/components/CoursePricing'; // Import Locale type
import CourseTimer from '@/components/CourseTimer'; // Import the timer component
import CourseTargetAudience from '@/components/CourseTargetAudience'; // Import the target audience component
import CourseFAQ from '@/components/CourseFAQ'; // Import the FAQ component
import CourseRelatedCourses from '@/components/CourseRelatedCourses'; // Import the related courses component
import CourseCertificateInfo from '@/components/CourseCertificateInfo'; // Import the certificate info component
import CourseCommunitySupport from '@/components/CourseCommunitySupport'; // Import the community/support component

interface CoursePageProps {
  params: {
    lang: string;
    slug: string;
  };
}

// Define a type for the combined data
interface CoursePageData {
  course: Course | null;
  reviews: Review[];
}

// Fetch course data and reviews on the server
async function getCourseData(slug: string, locale: string): Promise<CoursePageData> {
  try {
    const payload = await getPayloadClient();
    const courseResult = await payload.find({
      collection: 'courses',
      where: {
        slug: { equals: slug },
        // Optionally add status filter if needed:
        // status: { equals: 'published' },
      },
      locale: locale as 'en' | 'ru' | undefined, // Use literal type for locale
      limit: 1,
      depth: 3, // Increase depth to fetch instructors, modules, etc.
    });

    const course = courseResult.docs[0] || null;

    let reviews: Review[] = [];
    if (course) {
      const reviewsResult = await payload.find({
        collection: 'reviews', // Assuming 'reviews' is the slug
        where: {
          course: { equals: course.id }, // Assuming 'course' is the relationship field
        },
        locale: locale as 'en' | 'ru' | undefined,
        limit: 5, // Fetch first 5 reviews
        depth: 1, // Depth 1 to populate the 'user' field
        sort: '-createdAt', // Optional: sort by newest first
      });
      reviews = reviewsResult.docs;
    }

    return { course, reviews };
  } catch (error) {
    console.error('Error fetching course data:', error);
    // Return null or throw error based on desired handling
    return { course: null, reviews: [] };
  }
}

// Helper type guard to check if user is populated
const isUser = (user: string | User): user is User => typeof user === 'object' && user !== null && 'name' in user;

// Define the page component
export default async function CoursePage({ params }: CoursePageProps) {
  const { lang, slug } = await params;
  const { course, reviews } = await getCourseData(slug, lang);

  // Handle course not found - reviews will be empty array in this case
  if (!course) {
    notFound(); // Use Next.js notFound helper to render 404 page
  }

  // Render course details with updated structure and components
  return (
    <main> {/* Use main tag for semantic structure */}
      {/* Course Hero Section */}
      <CourseHero
        title={course.title}
        subtitle={course.subtitle}
        featuredImage={course.featuredImage}
      />

      {/* Timer Section (conditionally rendered inside component) */}
      <CourseTimer
        enrollmentStartDate={course.enrollmentStartDate}
        enrollmentEndDate={course.enrollmentEndDate}
      />

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8 md:py-12 space-y-12 md:space-y-16">

        {/* Pricing Section */}
        {/* Assuming CoursePricing is styled appropriately */}
        <CoursePricing product={course.product} locale={lang as Locale} />

        {/* Outcomes Section */}
        <CourseOutcomes learningObjectives={course.learningObjectives} />

        {/* Details Section */}
        <CourseDetails
          difficulty={course.difficulty}
          estimatedDuration={course.estimatedDuration}
          courseFormat={course.courseFormat}
          prerequisites={course.prerequisites}
        />
{/* Target Audience Section */}
        <CourseTargetAudience />

        {/* Curriculum Section */}
        <CourseCurriculum modules={course.modules} />
{/* Certificate Info Section */}
        <CourseCertificateInfo />

        {/* Instructors Section */}
        <CourseInstructor instructors={course.instructors} />

        {/* Reviews Section */}
        <CourseReviews
          averageRating={course.averageRating}
          totalReviews={course.totalReviews}
          reviews={reviews}
        />

        {/* FAQ Section */}
        <CourseFAQ />

        {/* Related Courses Section */}
{/* Community/Support Section */}
        <CourseCommunitySupport />
        <CourseRelatedCourses />

      </div>
    </main>
  );
}

// Optional: Generate Metadata (improves SEO)
// import type { Metadata } from 'next';
//
// export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
//   const { lang, slug } = params;
//   const course = await getCourse(slug, lang);
//
//   if (!course) {
//     return {
//       title: 'Course Not Found',
//     };
//   }
//
//   return {
//     title: course.title,
//     description: course.excerpt || course.description,
//     // Add other metadata like openGraph images etc.
//   };
// }
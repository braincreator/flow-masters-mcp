import React from 'react';
import { useTranslations } from 'next-intl';
import type { Course } from '@/payload-types'; // Import Course type
import { CourseCard } from '@/components/CourseCard'; // Assuming CourseCard component exists

interface CourseRelatedCoursesProps {
  title?: Course['relatedCoursesTitle'];
  courses?: Course['relatedCourses']; // Array of Course objects or strings (IDs)
}

const CourseRelatedCourses: React.FC<CourseRelatedCoursesProps> = ({ title, courses }) => {
  const t = useTranslations('CoursePage');

  // Filter out any non-object items (like IDs if population failed) and ensure courses exist
  const validCourses = courses?.filter((course): course is Course => typeof course === 'object' && course !== null) || [];

  // Don't render if no valid related courses
  if (validCourses.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
          {title || t('course.relatedCourses.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {validCourses.map((course) => (
            // Explicitly pass props to CourseCard
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              slug={course.slug ?? ''} // Provide fallback for required string
              excerpt={course.excerpt ?? undefined} // Convert null to undefined
              featuredImage={
                typeof course.featuredImage === 'object' && course.featuredImage?.url
                  ? { url: course.featuredImage.url, alt: course.featuredImage.alt ?? undefined } // Ensure url is string and pass alt
                  : undefined
              }
              difficulty={course.difficulty ?? undefined} // Convert null to undefined
              estimatedDuration={course.estimatedDuration ?? undefined} // Convert null to undefined
              product={
                typeof course.product === 'object' && course.product !== null
                  ? {
                      id: course.product.id,
                      pricing: course.product.pricing // Check if pricing exists before accessing properties
                        ? {
                            finalPrice: course.product.pricing.finalPrice ?? undefined, // Convert null to undefined
                            compareAtPrice: course.product.pricing.compareAtPrice ?? undefined, // Convert null to undefined
                          }
                        : undefined,
                    }
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseRelatedCourses;
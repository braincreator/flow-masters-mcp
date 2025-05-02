import React from 'react';
import CourseCard from '@/components/courses/CourseCard'; // Default import
import { getPayloadClient } from '@/utilities/payload/index';
import { Metadata } from 'next';
import { Course } from '@/payload-types';
import { Locale } from '@/constants'; // Import Locale type
import { getTranslations } from 'next-intl/server';

interface CoursesPageProps {
  params: {
    lang: Locale; // Use Locale type
  };
}

export default async function CoursesPage({ params: { lang } }: CoursesPageProps) {
  const t = await getTranslations({ locale: lang, namespace: 'CoursesPage' });
  const payload = await getPayloadClient();
  const { docs: courses } = await payload.find({
    collection: 'courses',
    where: {
      status: { equals: 'published' },
    },
    limit: 12, // TODO: Implement pagination
    locale: lang as Locale, // Cast lang to Locale type
    fallbackLocale: 'en', // Adjust fallback as needed
    depth: 1, // Ensure related data like featuredImage is fetched
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      {/* Course grid */}
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: Course) => (
            <CourseCard key={course.id} course={course as Course} locale={lang} /> // Pass lang as locale
          ))}
        </div>
      ) : (
        <p>{t('noCourses')}</p>
      )}
      {/* Add pagination controls if needed */}
    </div>
  );
}

// Add metadata generation
export async function generateMetadata(props: CoursesPageProps): Promise<Metadata> {
  const lang = props.params.lang;
  const t = await getTranslations({ locale: lang, namespace: 'CoursesPage' });
  // TODO: Fetch dynamic title/description if needed, potentially from a global setting
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    // Add other relevant metadata tags
  };
}
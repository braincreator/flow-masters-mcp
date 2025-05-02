import React from 'react';
import { notFound } from 'next/navigation';
import { getPayloadClient } from '@/utilities/payload/index'; // Assuming this path is correct
import type { Course } from '@/payload-types'; // Assuming this path is correct
import type { Block } from '@/types/blocks'; // Import generic Block type
import { RenderBlocks } from '@/blocks/RenderBlocks'; // Import the block renderer

interface CoursePageProps {
  params: {
    lang: string;
    slug: string;
  };
}

// Fetch course data on the server
async function getCourse(slug: string, locale: string): Promise<Course | null> {
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
      depth: 2, // Increase depth to ensure layout blocks are populated
    });

    return courseResult.docs[0] || null;
  } catch (error) {
    console.error('Error fetching course:', error);
    // Return null or throw error based on desired handling
    return null;
  }
}

// Define the page component
export default async function CoursePage({ params }: CoursePageProps) {
  const { lang, slug } = await params;
  const course = await getCourse(slug, lang);

  // Handle course not found
  if (!course) {
    notFound(); // Use Next.js notFound helper to render 404 page
  }

  // Render course details
  return (
    <div className="course-page-content"> {/* Optional: Add a wrapper class */}
      {/* Render the course content using the page builder blocks, casting layout to Block[] */}
      <RenderBlocks blocks={course.layout as Block[]} />
    </div>
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
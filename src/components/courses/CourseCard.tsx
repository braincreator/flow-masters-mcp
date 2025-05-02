import React from 'react';
import { Course, Media } from '@/payload-types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Import from ui/card
import { Image } from '@/components/Image';
import Link from 'next/link'; // Import standard Next.js Link
import { Button } from '@/components/ui/button'; // Import Button component
import { getTranslations } from 'next-intl/server';
import { Locale } from '@/constants'; // Import Locale from constants

interface CourseCardProps {
  course: Course;
  locale: Locale;
}

const CourseCard: React.FC<CourseCardProps> = async ({ course, locale }) => {
  const t = await getTranslations({ locale, namespace: 'CourseCard' }); // Corrected function call

  // Ensure featuredImage is populated and is of type Media
  const featuredImage = course.featuredImage as Media | undefined;
  const imageUrl = featuredImage?.url || '/placeholder-image.jpg'; // Provide a fallback image path
  const imageAlt = featuredImage?.alt || t('courseImageAlt', { title: course.title });

  const courseUrl = `/${locale}/courses/${course.slug}`;

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <Link href={courseUrl} aria-label={t('viewCourseAria', { title: course.title })}>
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={400} // Adjust width as needed
            height={225} // Adjust height for aspect ratio
            className="w-full aspect-video object-cover" // Use aspect ratio
          />
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg font-semibold mb-2">
          <Link href={courseUrl} className="hover:underline">
            {course.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {course.excerpt}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="default" size="sm" asChild>
          <Link href={courseUrl}>{t('viewCourse')}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;

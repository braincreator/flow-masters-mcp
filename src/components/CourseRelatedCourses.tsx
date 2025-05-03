import React from 'react';
import { useTranslations } from 'next-intl';

// Placeholder data - replace with actual data fetching later
const relatedCourses = [
  { id: 1, title: 'Introduction to Web Development', thumbnail: '/placeholder-thumb.jpg' },
  { id: 2, title: 'Advanced React Techniques', thumbnail: '/placeholder-thumb.jpg' },
  { id: 3, title: 'State Management with Zustand', thumbnail: '/placeholder-thumb.jpg' },
];

const CourseRelatedCourses: React.FC = () => {
  // Assuming 'CoursePage' namespace or create a specific one if needed
  const t = useTranslations('CoursePage');

  return (
    <div className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
          {t('course.relatedCourses.title')}
        </h2>
        {/* Placeholder related courses data - should be dynamic */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedCourses.map((course) => (
            <div key={course.id} className="bg-card rounded-lg shadow-md overflow-hidden">
              {/* Placeholder for thumbnail */}
              <div className="w-full h-48 bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">Thumbnail</span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-card-foreground">{course.title}</h3>
                {/* Add more course details here if needed */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseRelatedCourses;
// src/components/CourseTargetAudience.tsx
import React from 'react';
import { useTranslations } from 'next-intl';
// Removed incorrect import: import type { RichTextField } from '@payloadcms/richtext-lexical';
import { RichText } from '@/components/RichText'; // Import from directory index
import type { Course } from '@/payload-types'; // Import Course type

interface CourseTargetAudienceProps {
  title?: string | null; // Optional title from CMS
  description?: Course['targetAudienceDescription']; // Use type from generated types
}

const CourseTargetAudience: React.FC<CourseTargetAudienceProps> = ({ title, description }) => {
  const t = useTranslations('CoursePage');

  // Don't render the section if there's no description content
  if (!description || !description.root || description.root.children.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-4">{title || t('course.targetAudience.title')}</h2>{' '}
      {/* Use prop title or fallback */}
      {/* Render dynamic content */}
      <div className="prose dark:prose-invert max-w-none">
        {' '}
        {/* Add prose styling */}
        <RichText data={description} />
      </div>
    </div>
  )
};

export default CourseTargetAudience;
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { Course } from '@/payload-types'; // Assuming this path is correct
import { RichText } from '@/components/RichText'; // Assuming default export or named export 'RichText'

interface CourseOutcomesProps {
  learningObjectives: Course['learningObjectives'];
}

export const CourseOutcomes: React.FC<CourseOutcomesProps> = ({ learningObjectives }) => {
  const t = useTranslations('CoursePage');

  // Check if learningObjectives exist and have content
  // The RichText component likely handles empty/null checks internally,
  // but an explicit check adds robustness.
  const hasContent = learningObjectives && learningObjectives.root && learningObjectives.root.children && learningObjectives.root.children.length > 0;

  if (!hasContent) {
    return null; // Don't render anything if there are no objectives
  }

  return (
    <div className="course-outcomes mb-8 p-6 bg-gray-100 rounded-lg shadow"> {/* Basic styling */}
      <h2 className="text-2xl font-semibold mb-4">{t('outcomesHeading')}</h2>
      {/* Render the Rich Text content */}
      <RichText data={learningObjectives} />
    </div>
  );
};

export default CourseOutcomes;
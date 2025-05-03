'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { Course } from '@/payload-types';
import RichText from '@/components/RichText'; // Ensure correct import path

interface CourseOutcomesProps {
  learningObjectives: Course['learningObjectives'];
}

export const CourseOutcomes: React.FC<CourseOutcomesProps> = ({ learningObjectives }) => {
  const t = useTranslations('CoursePage');

  // Check if learningObjectives exist and have content
  const hasContent = learningObjectives &&
                     learningObjectives.root &&
                     learningObjectives.root.children &&
                     learningObjectives.root.children.length > 0 &&
                     // Check if the first child has content or if there's more than one child
                     (learningObjectives.root.children.length > 1 ||
                      (learningObjectives.root.children[0] as any)?.children?.length > 0);


  if (!hasContent) {
    return null; // Don't render anything if there are no objectives
  }

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-foreground mb-8">{t('outcomesHeading')}</h2>
        {/* Apply prose styles for RichText content, customizing list appearance */}
        <div className="prose prose-lg lg:prose-xl max-w-none mx-auto dark:prose-invert
                        prose-ul:list-none prose-ul:pl-0 prose-li:pl-8 prose-li:relative prose-li:mb-2
                        before:prose-li:content-['✓'] before:prose-li:absolute before:prose-li:left-0 before:prose-li:top-0
                        before:prose-li:text-success before:prose-li:font-bold before:prose-li:text-xl">
          <RichText data={learningObjectives} />
        </div>
      </div>
    </section>
  );
};

export default CourseOutcomes;
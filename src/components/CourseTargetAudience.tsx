// src/components/CourseTargetAudience.tsx
import React from 'react';
import { useTranslations } from 'next-intl';

interface CourseTargetAudienceProps {
  // Define props here if needed in the future, e.g., targetAudienceText: string;
}

const CourseTargetAudience: React.FC<CourseTargetAudienceProps> = () => {
  // Assuming 'CoursePage' namespace is appropriate or create a new one if needed
  const t = useTranslations('CoursePage');

  return (
    <div className="py-8"> {/* Added padding for spacing */}
      <h2 className="text-2xl font-bold mb-4">{t('course.targetAudience.title')}</h2> {/* Heading */}
      {/* Placeholder text - likely to be replaced by dynamic CMS content */}
      <p className="text-muted-foreground">
        This course is designed for individuals looking to [mention target audience characteristics, e.g., start their career in X, improve their skills in Y, understand Z]. No prior experience in [mention prerequisite, if any] is required, although familiarity with [mention related concepts] can be helpful. Ideal participants include [mention specific roles or groups, e.g., beginners, developers, managers].
      </p>
    </div>
  );
};

export default CourseTargetAudience;
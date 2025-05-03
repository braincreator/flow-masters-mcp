import React from 'react';
import { useTranslations } from 'next-intl';

const CourseCommunitySupport: React.FC = () => {
  // Assuming 'CoursePage' namespace or create a specific one if needed
  const t = useTranslations('CoursePage'); 

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6 text-foreground">
          {t('course.community.title')}
        </h2>
        <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('course.community.description')}
        </p>
        {/* Placeholder for future links or interactive elements */}
        <div className="mt-8 text-center">
          {/* Example: <a href="#" className="text-primary hover:underline">{t('course.community.forumLink')}</a> */}
          {/* Example: <a href="#" className="ml-4 text-primary hover:underline">{t('course.community.supportLink')}</a> */}
        </div>
      </div>
    </section>
  );
};

export default CourseCommunitySupport;
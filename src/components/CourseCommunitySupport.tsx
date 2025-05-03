import React from 'react';
import { useTranslations } from 'next-intl';

const CourseCommunitySupport: React.FC = () => {
  // Assuming 'CoursePage' namespace or create a specific one if needed
  const t = useTranslations('CoursePage'); 

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          {t('course.community.title')}
        </h2>
        <p className="text-center text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          {t('course.community.description')}
        </p>
        {/* Placeholder for future links or interactive elements */}
        <div className="mt-8 text-center">
          {/* Example: <a href="#" className="text-blue-600 hover:underline">{t('course.community.forumLink')}</a> */}
          {/* Example: <a href="#" className="ml-4 text-blue-600 hover:underline">{t('course.community.supportLink')}</a> */}
        </div>
      </div>
    </section>
  );
};

export default CourseCommunitySupport;
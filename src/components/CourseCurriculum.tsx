'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { Course } from '@/payload-types'; // Assuming Course type is available

// Define the props interface
interface CourseCurriculumProps {
  modules: Course['modules']; // Use the modules type from the Course type
}

const CourseCurriculum: React.FC<CourseCurriculumProps> = ({ modules }) => {
  const t = useTranslations('CoursePage');

  // Check if modules data is available
  if (!modules || modules.length === 0) {
    return <p>{t('curriculumNoData')}</p>; // Or some other placeholder
  }

  return (
    <div className="course-curriculum">
      <h2>{t('curriculumHeading')}</h2>
      {modules.map((module) => (
        <div key={typeof module === 'object' ? module.id : module} className="module-section mb-4">
          {typeof module === 'object' && module.name && (
            <>
              <h3 className="text-xl font-semibold mb-2">{module.name}</h3>
              {module.lessons && module.lessons.length > 0 ? (
                <ul className="list-disc list-inside ml-4">
                  {module.lessons.map((lesson) => (
                    <li key={typeof lesson === 'object' ? lesson.id : lesson} className="mb-1">
                      {typeof lesson === 'object' && lesson.title ? lesson.title : t('curriculumUnnamedLesson')}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ml-4 text-gray-500">{t('curriculumNoLessonsInModule')}</p>
              )}
            </>
          )}
           {typeof module !== 'object' && (
             <p className="text-red-500">{t('curriculumInvalidModuleData', { id: module })}</p> // Handle case where module is just an ID
           )}
        </div>
      ))}
    </div>
  );
};

export default CourseCurriculum;
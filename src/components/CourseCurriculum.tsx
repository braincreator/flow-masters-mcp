'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Course, Module, Lesson } from '@/payload-types'; // Assuming types are available

// Helper type guard to check if module/lesson is populated
const isPopulated = <T extends { id: string }>(item: string | T): item is T =>
  typeof item === 'object' && item !== null && 'id' in item;

// Define the props interface
interface CourseCurriculumProps {
  modules: Course['modules']; // Use the modules type from the Course type
}

const CourseCurriculum: React.FC<CourseCurriculumProps> = ({ modules }) => {
  const t = useTranslations('CoursePage');
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  // Check if modules data is available
  if (!modules || modules.length === 0) {
    return (
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">{t('curriculumHeading')}</h2>
          <p className="text-center text-muted-foreground">{t('curriculumNoData')}</p>
        </div>
      </section>
    );
  }

  const toggleModule = (moduleId: string) => {
    setOpenModuleId(openModuleId === moduleId ? null : moduleId);
  };

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">{t('curriculumHeading')}</h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          {modules.map((moduleOrId, index) => {
            if (!isPopulated<Module>(moduleOrId)) {
              return (
                <div key={moduleOrId} className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
                  {t('curriculumInvalidModuleData', { id: moduleOrId })}
                </div>
              );
            }

            const moduleData = moduleOrId;
            const isOpen = openModuleId === moduleData.id;

            return (
              <div key={moduleData.id} className="border border-border rounded-lg overflow-hidden shadow-sm bg-card">
                <button
                  onClick={() => toggleModule(moduleData.id)}
                  className="w-full flex justify-between items-center p-4 text-left text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-expanded={isOpen}
                  aria-controls={`module-content-${moduleData.id}`}
                >
                  <h3 className="text-lg font-semibold">
                    <span className="text-primary mr-2">{(index + 1).toString().padStart(2, '0')}.</span>
                    {moduleData.name || t('curriculumUnnamedModule')}
                  </h3>
                  <svg
                    className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor" // Inherits text-foreground from button
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div
                  id={`module-content-${moduleData.id}`}
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
                >
                  <div className="p-4 border-t border-border bg-muted">
                    {moduleData.description && <p className="text-sm text-muted-foreground mb-4">{moduleData.description}</p>}
                    {moduleData.lessons && moduleData.lessons.length > 0 ? (
                      <ul className="space-y-2">
                        {moduleData.lessons.map((lessonOrId) => {
                          if (!isPopulated<Lesson>(lessonOrId)) {
                            return (
                              <li key={lessonOrId} className="text-sm text-destructive">
                                {t('curriculumInvalidLessonData', { id: lessonOrId })}
                              </li>
                            );
                          }
                          const lesson = lessonOrId;
                          return (
                            <li key={lesson.id} className="flex items-center text-sm text-foreground">
                              <svg className="w-4 h-4 mr-2 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                              {lesson.title || t('curriculumUnnamedLesson')}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('curriculumNoLessonsInModule')}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CourseCurriculum;
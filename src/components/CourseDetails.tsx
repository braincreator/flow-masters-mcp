'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Course } from '@/payload-types'; // Assuming payload types are in @/payload-types
import RichText from './RichText'; // Assuming a RichText component exists

interface CourseDetailsProps {
  difficulty: Course['difficulty'];
  estimatedDuration: Course['estimatedDuration'];
  courseFormat: Course['courseFormat'];
  prerequisites: Course['prerequisites']; // Assuming prerequisites is RichText or similar
}

const CourseDetails: React.FC<CourseDetailsProps> = ({
  difficulty,
  estimatedDuration,
  courseFormat,
  prerequisites,
}) => {
  const t = useTranslations('CoursePage');

  return (
    <div className="course-details bg-gray-100 p-6 rounded-lg shadow-sm mb-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('detailsHeading')}</h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {difficulty && (
          <div>
            <dt className="font-medium text-gray-600">{t('detailsDifficultyLabel')}</dt>
            <dd className="text-gray-800 capitalize">{difficulty}</dd>
          </div>
        )}
        {estimatedDuration && (
          <div>
            <dt className="font-medium text-gray-600">{t('detailsDurationLabel')}</dt>
            <dd className="text-gray-800">{estimatedDuration}</dd> {/* Add units if needed */}
          </div>
        )}
        {courseFormat && (
          <div>
            <dt className="font-medium text-gray-600">{t('detailsFormatLabel')}</dt>
            <dd className="text-gray-800 capitalize">{courseFormat}</dd>
          </div>
        )}
        {/* Handle prerequisites if it's a relationship field */}
         {Array.isArray(prerequisites) && prerequisites.length > 0 && (
          <div className="md:col-span-2">
            <dt className="font-medium text-gray-600 mb-1">{t('detailsPrerequisitesLabel')}</dt>
            <dd>
              <ul className="list-disc list-inside text-gray-700">
                {prerequisites.map((prereq) => {
                  // Check if prereq is a populated Course object
                  if (typeof prereq === 'object' && prereq !== null && 'title' in prereq) {
                    return <li key={prereq.id}>{prereq.title}</li>;
                  }
                  // Skip if it's just a string ID
                  return null;
                })}
              </ul>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
};

export default CourseDetails;
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import type { Course } from '@/payload-types'; // Assuming payload types are in @/payload-types
import RichText from './RichText'; // Assuming a RichText component exists

// --- SVG Icons (Example using Heroicons outline style) ---
const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-primary">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-primary">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ComputerDesktopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-primary">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
  </svg>
);

const ClipboardDocumentListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-primary">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75c0-.231-.035-.454-.1-.664M6.75 7.5H18a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 18.75V9.75A2.25 2.25 0 0 1 6.75 7.5Z" />
  </svg>
);
// --- End Icons ---

interface CourseDetailsProps {
  difficulty: Course['difficulty'];
  estimatedDuration: Course['estimatedDuration'];
  courseFormat: Course['courseFormat'];
  prerequisites: Course['prerequisites']; // NOTE: Assuming this is a relationship field based on current rendering logic. If it's RichText, update rendering.
}

// Helper type guard for populated Course objects (if prerequisites is a relationship)
const isPopulatedCourse = (item: string | Course | null | undefined): item is Course =>
  typeof item === 'object' && item !== null && 'id' in item && 'title' in item;


const CourseDetails: React.FC<CourseDetailsProps> = ({
  difficulty,
  estimatedDuration,
  courseFormat,
  prerequisites,
}) => {
  const t = useTranslations('CoursePage');
  const tDuration = useTranslations('DurationUnits');

  // Helper function to parse and translate duration
  const formatDuration = (durationString: string | null | undefined): string => {
    if (!durationString) return '';
    // Match number and unit (day, hour, month, week), ignore plural 's', case-insensitive
    const match = durationString.match(/^(\d+)\s+(day|hour|month|week)s?$/i);

    // Ensure match and captured groups exist before proceeding
    if (!match || !match[1] || !match[2]) {
      return durationString; // Return original string if format is unexpected or groups are missing
    }

    const count = parseInt(match[1], 10);
    // Ensure count is a valid number
    if (isNaN(count)) {
        return durationString; // Return original if count is not a number
    }

    const unitKey = match[2].toLowerCase(); // unitKey is now definitely a string: 'day', 'hour', 'month', or 'week'

    // Check if the translation key exists in the DurationUnits namespace
    // Note: next-intl's `raw` might not be standard or stable. A simple check might be better,
    // or rely on try-catch. Let's use try-catch for robustness.
    try {
      // Use the string unitKey directly. next-intl handles pluralization based on the key and count.
      return tDuration(unitKey, { count });
    } catch (e) {
      // Log error if translation fails (e.g., key doesn't exist in messages/ru.json)
      logError(`Error translating duration unit '${unitKey}' with count ${count}:`, e);
      return durationString; // Fallback to original string on error
    }
  };


  // Filter prerequisites if it's an array of relationships
  const validPrerequisites = Array.isArray(prerequisites)
    ? prerequisites.filter(isPopulatedCourse)
    : [];

  // Check if there's any detail to display
  const hasDetails = difficulty || estimatedDuration || courseFormat || validPrerequisites.length > 0;

  if (!hasDetails) {
    return null; // Don't render the section if no details are provided
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="bg-card p-6 sm:p-8 rounded-xl shadow-lg border border-border">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">{t('detailsHeading')}</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            {difficulty && (
              <div className="flex items-start">
                <BarChartIcon />
                <div>
                  <dt className="font-semibold text-foreground">{t('detailsDifficultyLabel')}</dt>
                  {/* Use dynamic key based on difficulty value, ensure difficulty exists */}
                  <dd className="text-muted-foreground">{difficulty ? t(`difficulty${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}` as any) : ''}</dd>
                </div>
              </div>
            )}
            {estimatedDuration && (
              <div className="flex items-start">
                <ClockIcon />
                <div>
                  <dt className="font-semibold text-foreground">{t('detailsDurationLabel')}</dt>
                  {/* Use the formatDuration helper */}
                  <dd className="text-muted-foreground">{formatDuration(estimatedDuration)}</dd>
                </div>
              </div>
            )}
            {courseFormat && (
              <div className="flex items-start">
                <ComputerDesktopIcon />
                <div>
                  <dt className="font-semibold text-foreground">{t('detailsFormatLabel')}</dt>
                  {/* Use dynamic key based on courseFormat value, ensure courseFormat exists */}
                  <dd className="text-muted-foreground">{courseFormat ? t(`format${courseFormat.charAt(0).toUpperCase() + courseFormat.slice(1)}` as any) : ''}</dd>
                </div>
              </div>
            )}
            {validPrerequisites.length > 0 && (
              <div className="sm:col-span-2 flex items-start">
                <ClipboardDocumentListIcon />
                <div>
                  <dt className="font-semibold text-foreground mb-1">{t('detailsPrerequisitesLabel')}</dt>
                  <dd>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      {validPrerequisites.map((prereq) => (
                        <li key={prereq.id}>{prereq.title}</li> // Assuming 'title' exists on the related Course object
                      ))}
                    </ul>
                  </dd>
                  {/* If prerequisites were RichText, you'd render like this instead: */}
                  {/* <dd className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert"><RichText data={prerequisites} /></dd> */}
                </div>
              </div>
            )}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default CourseDetails;
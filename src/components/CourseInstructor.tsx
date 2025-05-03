'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Course, User, ExpertiseTag, Media } from '@/payload-types'; // Added Media type
import RichText from '@/components/RichText';

// Helper type guard for populated objects
const isPopulated = <T extends { id: string }>(item: string | T | null | undefined): item is T =>
  typeof item === 'object' && item !== null && 'id' in item;

// Define the structure for social media links if not explicitly typed in User
interface SocialMediaLink {
  platform: string; // e.g., 'linkedin', 'twitter', 'website'
  url: string;
  id?: string | null; // Optional ID from Payload array field
}

// Define the props for the component
interface CourseInstructorProps {
  instructors: Course['instructors']; // Use the raw type from Course
}

const CourseInstructor: React.FC<CourseInstructorProps> = ({ instructors }) => {
  const t = useTranslations('CoursePage');

  // Filter out any potential string/number IDs and ensure instructors is an array
  const validInstructors = Array.isArray(instructors)
    ? instructors.filter(isPopulated<User>)
    : [];

  if (validInstructors.length === 0) {
    return null; // Don't render anything if no valid instructors
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">{t('instructorsHeading')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {validInstructors.map((instructor) => {
            // Ensure expertise tags are populated objects
            const expertiseTags = Array.isArray(instructor.expertiseAreas)
              ? instructor.expertiseAreas.filter(isPopulated<ExpertiseTag>)
              : [];

            // Ensure social media links are populated objects with URLs
            const socialLinks = Array.isArray(instructor.socialMediaLinks)
              ? (instructor.socialMediaLinks as SocialMediaLink[]).filter(link => typeof link === 'object' && link !== null && link.url)
              : [];

            // Ensure profile picture is a populated Media object
            const profilePicture = isPopulated<Media>(instructor.instructorProfilePicture)
              ? instructor.instructorProfilePicture
              : null;

            return (
              <div key={instructor.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-shadow duration-300 hover:shadow-xl p-8 flex flex-col space-y-5">
                {/* Improved Card Styling - Comment moved inside */}
                {/* Profile Picture - Centered */}
                <div className="mx-auto"> {/* Center the container */}
                  {profilePicture && profilePicture.url ? (
                    <Image
                      src={profilePicture.url}
                      alt={profilePicture.alt ?? instructor.name ?? t('instructorsImageAltFallback')}
                      width={120} // Keep size or adjust as needed
                      height={120}
                      className="rounded-full object-cover border border-gray-200" // Ensure avatar is round
                    />
                  ) : (
                    <div className="w-30 h-30 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-4xl font-bold mx-auto"> {/* Ensure fallback is centered */}
                      {instructor.name?.charAt(0) ?? '?'}
                    </div>
                  )}
                </div>

                {/* Name - Centered */}
                <h3 className="text-xl font-bold text-gray-900 text-center">{instructor.name}</h3>
                {/* Optional: Title/Role */}
                {/* {instructor.title && <p className="text-sm text-blue-600 font-medium mb-3 text-center">{instructor.title}</p>} */}

                {/* Biography - Left Aligned */}
                {instructor.instructorBio && (
                   <div className="prose dark:prose-invert text-gray-700 max-w-none"> {/* Removed text-left, prose-sm, changed color */}
                     <RichText data={instructor.instructorBio} />
                   </div>
                )}

                {/* Expertise Areas - Left Aligned */}
                {expertiseTags.length > 0 && (
                  <div className="w-full">
                    <h4 className="font-semibold text-base text-gray-800 mb-3">{t('instructorsExpertiseLabel')}</h4> {/* Removed text-left, increased size/weight */}
                    <ul className="flex flex-wrap gap-2 justify-start">
                      {expertiseTags.map((tag) => (
                        <li key={tag.id} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full"> {/* Neutral colors, larger text */}
                          {tag.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Social Media Links - Left Aligned */}
                {socialLinks.length > 0 && (
                  <div className="mt-auto w-full pt-6 border-t border-gray-200"> {/* Increased pt */}
                    <h4 className="font-semibold text-base text-gray-800 mb-3">{t('instructorsConnectLabel')}</h4> {/* Removed text-left, increased size/weight */}
                    <ul className="flex flex-wrap gap-x-4 gap-y-2 justify-start">
                      {socialLinks.map((link) => (
                        <li key={link.id || link.url}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors duration-200" // Neutral colors, removed capitalize
                          >
                            {/* TODO: Replace with icons if available */}
                            {link.platform || t('instructorsSocialLinkFallback')}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CourseInstructor;
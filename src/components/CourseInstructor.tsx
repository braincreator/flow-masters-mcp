'use client';

import React from 'react';
import Image from 'next/image'; // Assuming Next.js Image component
import { useTranslations } from 'next-intl';
import { Course, User, ExpertiseTag } from '@/payload-types'; // Adjust path if needed
import RichText from '@/components/RichText'; // Import RichText component

// Define the structure for social media links if not explicitly typed in User
interface SocialMediaLink {
  platform: string; // e.g., 'linkedin', 'twitter', 'website'
  url: string;
  id?: string | null; // Optional ID from Payload array field
}

// Define the props for the component
interface CourseInstructorProps {
  // Use the populated instructors type from the Course type
  // Ensure the User type includes instructor-specific fields
  instructors: Exclude<Course['instructors'], string | number | undefined | null>;
}

const CourseInstructor: React.FC<CourseInstructorProps> = ({ instructors }) => {
  const t = useTranslations('CoursePage');

  // Check if instructors data is valid and is an array
  if (!instructors || !Array.isArray(instructors) || instructors.length === 0) {
    return null; // Don't render anything if no instructors
  }

  // Filter out any potential string/number IDs if the population wasn't perfect
  const validInstructors = instructors.filter(
    (instructor): instructor is User => typeof instructor === 'object' && instructor !== null && 'id' in instructor
  );

  if (validInstructors.length === 0) {
    return null;
  }

  return (
    <div className="course-instructors section-padding"> {/* Added basic class */}
      <h2 className="text-2xl font-bold mb-4">{t('instructorsHeading')}</h2> {/* Added heading */}
      {validInstructors.map((instructor) => {
        // Type assertion for expertise tags if needed, assuming they are populated objects
        const expertiseTags = (instructor.expertiseAreas as ExpertiseTag[])?.filter(tag => typeof tag === 'object' && tag !== null);
        // Type assertion/check for social media links
        const socialLinks = (instructor.socialMediaLinks as SocialMediaLink[])?.filter(link => typeof link === 'object' && link !== null && link.url);

        return (
          <div key={instructor.id} className="instructor-card mb-6 p-4 border rounded-lg shadow-sm flex items-start space-x-4"> {/* Basic card styling */}
            {/* Profile Picture */}
            {instructor.instructorProfilePicture && typeof instructor.instructorProfilePicture === 'object' && instructor.instructorProfilePicture.url && (
              <div className="flex-shrink-0">
                <Image
                  src={instructor.instructorProfilePicture.url}
                  alt={instructor.name ?? t('instructorsImageAltFallback')}
                  width={100} // Adjust size as needed
                  height={100}
                  className="rounded-full object-cover" // Basic image styling
                />
              </div>
            )}

            <div className="instructor-details flex-grow">
              {/* Name */}
              <h3 className="text-xl font-semibold mb-1">{instructor.name}</h3>

              {/* Biography - Render using RichText component */}
              {instructor.instructorBio && (
                 <div className="prose dark:prose-invert max-w-none mb-3"> {/* Added prose styling similar to other usages */}
                   <RichText data={instructor.instructorBio} />
                 </div>
              )}

              {/* Expertise Areas */}
              {expertiseTags && expertiseTags.length > 0 && (
                <div className="expertise-areas mb-3">
                  <h4 className="font-medium text-sm mb-1">{t('instructorsExpertiseLabel')}</h4>
                  <ul className="flex flex-wrap gap-2">
                    {expertiseTags.map((tag) => (
                      <li key={tag.id} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded"> {/* Basic tag styling */}
                        {tag.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Social Media Links */}
              {socialLinks && socialLinks.length > 0 && (
                <div className="social-links">
                  <h4 className="font-medium text-sm mb-1">{t('instructorsConnectLabel')}</h4>
                  <ul className="flex space-x-3">
                    {socialLinks.map((link) => (
                      <li key={link.id || link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline capitalize" // Basic link styling
                        >
                          {link.platform || t('instructorsSocialLinkFallback')} {/* Display platform name or fallback */}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CourseInstructor;
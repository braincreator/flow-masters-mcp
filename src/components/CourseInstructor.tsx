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
    <section className="py-12 bg-background"> {/* Use theme background */}
      <div className="container mx-auto px-4">
        {/* Heading color likely handled by global styles or parent, assuming it adapts */}
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">{t('instructorsHeading')}</h2>
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
              <div key={instructor.id} className="bg-card text-card-foreground rounded-xl shadow-lg border overflow-hidden transition-shadow duration-300 hover:shadow-xl p-8 flex flex-col space-y-5">
                {/* Use card styles from theme */}
                {/* Profile Picture - Centered */}
                <div className="mx-auto"> {/* Center the container */}
                  {profilePicture && profilePicture.url ? (
                    <Image
                      src={profilePicture.url}
                      alt={profilePicture.alt ?? instructor.name ?? t('instructorsImageAltFallback')}
                      width={120} // Keep size or adjust as needed
                      height={120}
                      className="rounded-full object-cover border" // Use theme border
                    />
                  ) : (
                    // Use muted theme colors for fallback
                    <div className="w-30 h-30 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-4xl font-bold mx-auto">
                      {instructor.name?.charAt(0) ?? '?'}
                    </div>
                  )}
                </div>

                {/* Name - Centered */}
                <h3 className="text-xl font-bold text-foreground text-center">{instructor.name}</h3> {/* Use theme text */}
                {/* Optional: Title/Role */}
                {/* {instructor.title && <p className="text-sm text-primary font-medium mb-3 text-center">{instructor.title}</p>} */} {/* Example if using primary color */}

                {/* Biography - Left Aligned */}
                {instructor.instructorBio && (
                   <div className="prose dark:prose-invert text-foreground max-w-none">
                     {/* Use theme text, prose handles dark mode */}
                     <RichText data={instructor.instructorBio} />
                   </div>
                )}

                {/* Expertise Areas - Left Aligned */}
                {expertiseTags.length > 0 && (
                  <div className="w-full">
                    <h4 className="font-semibold text-base text-foreground mb-3">{t('instructorsExpertiseLabel')}</h4> {/* Use theme text */}
                    <ul className="flex flex-wrap gap-2 justify-start">
                      {expertiseTags.map((tag) => (
                        <li key={tag.id} className="bg-muted text-muted-foreground text-sm font-medium px-3 py-1 rounded-full">
                          {/* Use muted theme colors for tags */}
                          {tag.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Social Media Links - Left Aligned */}
                {socialLinks.length > 0 && (
                  <div className="mt-auto w-full pt-6 border-t border"> {/* Use theme border */}
                    <h4 className="font-semibold text-base text-foreground mb-3">{t('instructorsConnectLabel')}</h4> {/* Use theme text */}
                    <ul className="flex flex-wrap gap-x-4 gap-y-2 justify-start">
                      {socialLinks.map((link) => (
                        <li key={link.id || link.url}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            // Use muted theme colors for links, foreground on hover
                            className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors duration-200"
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
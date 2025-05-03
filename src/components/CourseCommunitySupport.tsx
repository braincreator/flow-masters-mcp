import React from 'react';
import { useTranslations } from 'next-intl';
import type { Course } from '@/payload-types'; // Import Course type
import RichText from '@/components/RichText'; // Import the default export (RichText)

interface CourseCommunitySupportProps {
  title?: Course['communitySupportTitle'];
  description?: Course['communitySupportDescription'];
  links?: Course['communitySupportLinks'];
}

const CourseCommunitySupport: React.FC<CourseCommunitySupportProps> = ({ title, description, links }) => {
  const t = useTranslations('CoursePage');

  const hasDescription = description && description.root && description.root.children.length > 0;
  const hasLinks = links && links.length > 0;

  // Don't render the section if there's no content
  if (!hasDescription && !hasLinks) {
    return null;
  }

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6 text-foreground">
          {title || t('course.community.title')}
        </h2>
        {hasDescription && (
          <div className="prose dark:prose-invert max-w-2xl mx-auto text-center mb-8"> {/* Centered prose */}
            <RichText data={description} /> {/* Pass prop as 'data' */}
          </div>
        )}
        {hasLinks && (
          <div className="mt-8 text-center space-x-4"> {/* Added space between links */}
            {links.map((link) => (
              link.url && link.label && ( // Ensure url and label exist
                <a
                  key={link.id} // Use link.id as key
                  href={link.url}
                  target="_blank" // Open external links in new tab
                  rel="noopener noreferrer" // Security for target="_blank"
                  className="text-primary hover:underline inline-block" // Ensure links are inline-block for spacing
                >
                  {link.label}
                </a>
              )
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CourseCommunitySupport;
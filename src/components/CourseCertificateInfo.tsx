// src/components/CourseCertificateInfo.tsx
import React from 'react';
import { useTranslations } from 'next-intl';
import type { Course, Media } from '@/payload-types'; // Import types
import RichText from '@/components/RichText'; // Import RichText renderer
import { Image } from '@/components/Image'; // Use named import for Image component

interface CourseCertificateInfoProps {
  title?: Course['certificateTitle'];
  offersCertificate?: Course['offersCertificate'];
  description?: Course['certificateDescription'];
  preview?: Course['certificatePreview']; // Can be string (ID) or Media object
}

const CourseCertificateInfo: React.FC<CourseCertificateInfoProps> = ({
  title,
  offersCertificate,
  description,
  preview,
}) => {
  const t = useTranslations('CoursePage');

  // Don't render the section if no certificate is offered
  if (!offersCertificate) {
    return null;
  }

  const hasDescription = description && description.root && description.root.children.length > 0;
  const hasPreview = preview && (typeof preview === 'object' || typeof preview === 'string');

  return (
    <div className="py-8 md:py-12 border-t border-border">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
        {title || t('course.certificate.title')}
      </h2>
      {hasDescription && (
        <div className="prose dark:prose-invert max-w-none mb-6">
          <RichText data={description} />
        </div>
      )}
      {hasPreview && (
        <div className="mt-6 bg-muted p-4 rounded-lg shadow max-w-md mx-auto relative aspect-video"> {/* Added relative and aspect ratio */}
          {/* Pass URL string if preview is Media object, otherwise undefined */}
          <Image
            resource={typeof preview === 'object' && preview?.url ? preview.url : undefined}
            alt={typeof preview === 'object' ? preview.alt || 'Certificate Preview' : 'Certificate Preview'}
            fill // Use fill layout
            className="object-contain rounded" // Keep object-contain
          />
        </div>
      )}
      {/* Render a default message if description and preview are missing but certificate is offered */}
      {!hasDescription && !hasPreview && (
         <p className="text-base md:text-lg text-muted-foreground">
           {t('course.certificate.completionMessage')} {/* Add a translation key like this */}
         </p>
      )}
    </div>
  );
};

export default CourseCertificateInfo;
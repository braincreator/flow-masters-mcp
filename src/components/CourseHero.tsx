'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { Media } from '@/payload-types'; // Assuming Media type path

interface CourseHeroProps {
  title?: string | null;
  subtitle?: string | null;
  featuredImage?: Media | string | null; // Adjust type based on actual Media type
}

export const CourseHero: React.FC<CourseHeroProps> = ({ title, subtitle, featuredImage }) => {
  const t = useTranslations('CoursePage');

  // Basic placeholder rendering
  return (
    <div style={{ border: '1px dashed grey', padding: '20px', marginBottom: '20px' }}>
      {/* Placeholder heading - likely remove or handle differently */}
      <h2>Course Hero Placeholder</h2>
      {featuredImage && typeof featuredImage !== 'string' && 'url' in featuredImage && (
        <img
          src={featuredImage.url ?? undefined}
          alt={featuredImage.alt ?? title ?? t('featuredImageAltFallback')}
          style={{ maxWidth: '200px', marginBottom: '10px' }}
        />
      )}
      {title && <h3>{title}</h3>}
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
};
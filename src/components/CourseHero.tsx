'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { Media } from '@/payload-types'; // Assuming Media type path
import Image from 'next/image'; // Use Next.js Image for optimization

interface CourseHeroProps {
  title?: string | null;
  subtitle?: string | null;
  featuredImage?: Media | string | null; // Adjust type based on actual Media type
}

export const CourseHero: React.FC<CourseHeroProps> = ({ title, subtitle, featuredImage }) => {
  const t = useTranslations('CoursePage');

  const imageUrl = featuredImage && typeof featuredImage !== 'string' && 'url' in featuredImage ? featuredImage.url : null;
  const imageAlt = featuredImage && typeof featuredImage !== 'string' && 'alt' in featuredImage ? featuredImage.alt : title ?? t('featuredImageAltFallback');

  return (
    <section className="bg-primary text-primary-foreground py-16 md:py-24">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        {/* Text Content */}
        <div className="order-2 md:order-1">
          {title && (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-6">
              {subtitle}
            </p>
          )}
          {/* Optional: Add a Call to Action button here if needed */}
          {/* <button className="bg-secondary text-secondary-foreground font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-secondary/90 transition duration-300">
            {t('enrollNow')}
          </button> */}
        </div>

        {/* Image */}
        {imageUrl && (
          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <div className="relative w-full max-w-md h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-xl">
              <Image
                src={imageUrl}
                alt={imageAlt ?? ''}
                layout="fill"
                objectFit="cover"
                priority // Prioritize loading the hero image
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
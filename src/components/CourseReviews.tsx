'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { Course, Review, User, Media } from '@/payload-types'; // Added Media
import Image from 'next/image'; // For user avatars

// Helper type guard to check if user is populated
const isUser = (user: string | User | undefined | null): user is User =>
  typeof user === 'object' && user !== null && 'id' in user;

// Helper type guard for populated Media
const isMedia = (media: string | Media | undefined | null): media is Media =>
  typeof media === 'object' && media !== null && 'id' in media;

interface CourseReviewsProps {
  averageRating: Course['averageRating'];
  totalReviews: Course['totalReviews'];
  reviews: Review[]; // Assuming Review type includes populated user
}

// Star Rating Component
const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ rating, size = 'md' }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  const starSizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div className="flex items-center text-accent"> {/* Use accent color for stars */}
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className={starSizeClass} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
      ))}
      {halfStar && (
        <svg key="half" className={starSizeClass} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292zM10 4.418v11.164l2.14 1.55a.5.5 0 00.76-.447l-.41-2.38 1.73-1.255a.5.5 0 00-.276-.853l-2.39-.348-1.07-2.17a.5.5 0 00-.896 0L9.049 4.418z"></path></svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className={`${starSizeClass} text-muted`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
      ))}
    </div>
  );
};

export const CourseReviews: React.FC<CourseReviewsProps> = ({
  averageRating,
  totalReviews,
  reviews,
}) => {
  const t = useTranslations('CoursePage');
  const validReviews = Array.isArray(reviews) ? reviews : [];
  const numTotalReviews = totalReviews ?? 0;
  const numAverageRating = averageRating ?? 0;

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">{t('reviewsHeading')}</h2>

        {/* Average Rating Summary */}
        {numTotalReviews > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-10">
            <span className="text-4xl font-bold text-foreground">{numAverageRating.toFixed(1)}</span>
            <div className="flex flex-col items-center sm:items-start">
              <StarRating rating={numAverageRating} size="md" />
              <span className="text-sm text-muted-foreground mt-1">
                {t('reviewsBasedOn', { count: numTotalReviews })}
              </span>
            </div>
          </div>
        )}

        {/* Review List */}
        <div className="space-y-6 max-w-3xl mx-auto">
          {validReviews.length > 0 ? (
            validReviews.map((review) => {
              const user = isUser(review.user) ? review.user : null;
              // Removed userAvatar as the field doesn't exist on the standard User type

              return (
                <article key={review.id} className="p-6 bg-card rounded-lg shadow-md border border-border">
                  <div className="flex items-start space-x-4">
                    {/* Avatar Placeholder */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold">
                        {user?.name?.charAt(0) ?? '?'}
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-md font-semibold text-foreground">
                          {user ? user.name : t('reviewsAnonymousUser')}
                        </h4>
                        <StarRating rating={review.rating ?? 0} size="sm" />
                      </div>
                      {/* Optional: Review Date */}
                      {/* {review.createdAt && <p className="text-xs text-muted-foreground mb-2">{new Date(review.createdAt).toLocaleDateString()}</p>} */}
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground">{t('reviewsNone')}</p>
          )}
        </div>

        {/* Optional: Placeholder for Load More button */}
        {/* {validReviews.length < numTotalReviews && (
          <div className="text-center mt-8">
            <button className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-muted transition">
              {t('reviewsLoadMore')}
            </button>
          </div>
        )} */}
      </div>
    </section>
  );
};

export default CourseReviews;
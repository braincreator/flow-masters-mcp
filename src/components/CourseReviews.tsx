'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { Course, Review, User } from '@/payload-types'; // Adjust path if needed

// Helper type guard to check if user is populated
const isUser = (user: string | User | undefined): user is User => typeof user === 'object' && user !== null && 'name' in user;

interface CourseReviewsProps {
  averageRating: Course['averageRating'];
  totalReviews: Course['totalReviews'];
  reviews: Review[]; // Assuming Review type includes populated user
}

export const CourseReviews: React.FC<CourseReviewsProps> = ({
  averageRating,
  totalReviews,
  reviews,
}) => {
  const t = useTranslations('CoursePage');

  return (
    <div className="course-reviews-section">
      <h2>{t('reviewsHeading')}</h2>
      <div className="average-rating">
        {/* Basic display for average rating - enhance with stars later */}
        <span>{t('reviewsAverageRatingLabel')} {averageRating?.toFixed(1) ?? 'N/A'}</span>
        <span> ({t('reviewsCountLabel', { count: totalReviews ?? 0 })})</span>
      </div>

      <div className="review-list">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <span className="reviewer-name">
                  {/* Check if user is populated */}
                  {isUser(review.user) ? review.user.name : t('reviewsAnonymousUser')}
                </span>
                <span className="review-rating">
                  {/* Basic display for rating - enhance with stars later */}
                  ({t('reviewsStarsLabel', { count: review.rating ?? 0 })})
                </span>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        ) : (
          <p>{t('reviewsNone')}</p>
        )}
      </div>

      {/* Optional: Placeholder for Load More button */}
      {/* <button>Load More Reviews</button> */}
    </div>
  );
};

// Basic styling (can be moved to a CSS module or Tailwind)
const styles = `
.course-reviews-section {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
}
.average-rating {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  font-weight: bold;
}
.review-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.review-item {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1rem;
}
.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.reviewer-name {
  font-weight: bold;
}
.review-rating {
  font-size: 0.9rem;
  color: #555;
}
.review-comment {
  margin-top: 0.5rem;
  color: #333;
}
`;

// Inject styles - In a real app, use CSS Modules, Tailwind, or styled-components
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default CourseReviews;
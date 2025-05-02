'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea component exists
import { Label } from '@/components/ui/label';
// Assuming a StarRatingInput component exists or can be created
// import StarRatingInput from '@/components/ui/StarRatingInput';

interface ReviewFormProps {
  courseId: string;
  enrollmentId: string; // Need the specific enrollment ID to link the review
  onReviewSubmitted?: () => void; // Optional callback after successful submission
}

const ReviewForm: React.FC<ReviewFormProps> = ({ courseId, enrollmentId, onReviewSubmitted }) => {
  const t = useTranslations('ReviewForm'); // Assuming translation namespace
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (rating < 1 || rating > 5) {
      setError(t('ratingRequiredError'));
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/reviews', {
        courseId,
        enrollmentId,
        rating,
        reviewText,
      });
      setSuccess(t('submitSuccess'));
      setRating(0); // Reset form
      setReviewText('');
      if (onReviewSubmitted) {
        onReviewSubmitted(); // Trigger callback if provided
      }
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setError(err?.response?.data?.message || t('submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Explicitly return JSX
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold">{t('formTitle')}</h3>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <div>
        <Label htmlFor="rating">{t('ratingLabel')}</Label>
        {/* Placeholder for StarRatingInput component */}
        <div className="flex space-x-1 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
              aria-label={`Rate ${star} out of 5`}
            >
              ★
            </button>
          ))}
        </div>
        {/* <StarRatingInput value={rating} onChange={setRating} /> */}
      </div>

      <div>
        <Label htmlFor="reviewText">{t('reviewLabel')}</Label>
        <Textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder={t('reviewPlaceholder')}
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isSubmitting || rating === 0}>
        {isSubmitting ? t('submitting') : t('submitButton')}
      </Button>
    </form>
  );
};

export default ReviewForm;
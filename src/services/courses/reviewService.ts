import { getPayloadClient } from '@/utilities/payload/index'
import type { Payload } from 'payload'
import type { CourseReview, User, Course, CourseEnrollment } from '../../payload-types' // Import necessary types

export interface SubmitReviewData {
  userId: string | User['id'];
  courseId: string | Course['id'];
  enrollmentId: string | CourseEnrollment['id'];
  rating: number;
  reviewText?: string;
}

export class ReviewService {
  private payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  /**
   * Submits a new review for a course.
   * Ensures the user is enrolled and hasn't reviewed this specific enrollment before.
   */
  async submitReview(data: SubmitReviewData): Promise<CourseReview> {
    const { userId, courseId, enrollmentId, rating, reviewText } = data;

    // 1. Validate input
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5.');
    }

    // 2. Verify enrollment exists and belongs to the user and course
    try {
      const enrollment = await this.payload.findByID({
        collection: 'course-enrollments',
        id: enrollmentId,
        depth: 0, // No need to populate relations deeply here
      });

      if (!enrollment || enrollment.user !== userId || enrollment.course !== courseId) {
        throw new Error('Invalid enrollment details provided.');
      }

      // Optional: Check if the user has already submitted a review for this *specific* enrollment
      const existingReview = await this.payload.find({
        collection: 'course-reviews',
        where: {
          enrollment: { equals: enrollmentId },
          user: { equals: userId }, // Double check user just in case
        },
        limit: 1,
        depth: 0,
      });

      if (existingReview.docs.length > 0) {
        throw new Error('You have already submitted a review for this enrollment.');
      }

    } catch (error) {
       console.error('Error verifying enrollment for review:', error);
       // Re-throw specific errors or a generic one
       if (error instanceof Error && error.message.includes('Invalid enrollment')) {
           throw error;
       }
       if (error instanceof Error && error.message.includes('already submitted')) {
           throw error;
       }
       throw new Error('Failed to verify enrollment status.');
    }


    // 3. Create the review (status defaults to 'pending')
    try {
      const newReview = await this.payload.create({
        collection: 'course-reviews',
        data: {
          user: userId,
          course: courseId,
          enrollment: enrollmentId,
          rating,
          reviewText: reviewText ?? '', // Ensure reviewText is not undefined
          status: 'pending', // Default status
        },
      });
      return newReview;
    } catch (error) {
      console.error('Error creating course review:', error);
      throw new Error('Failed to submit review.');
    }
  }

  /**
   * Fetches approved reviews for a specific course with pagination.
   */
  async getReviewsForCourse(courseId: string, page = 1, limit = 10): Promise<any> { // Consider using PaginatedDocs<CourseReview>
     try {
       const reviews = await this.payload.find({
         collection: 'course-reviews',
         where: {
           course: { equals: courseId },
           status: { equals: 'approved' },
         },
         limit,
         page,
         sort: '-createdAt', // Show newest first
         depth: 1, // Populate user data (adjust depth as needed)
       });
       return reviews;
     } catch (error) {
       console.error(`Error fetching reviews for course ${courseId}:`, error);
       throw new Error('Failed to fetch reviews.');
     }
  }

  /**
   * Calculates the average rating for a specific course based on approved reviews.
   */
  async calculateAverageRating(courseId: string): Promise<{ average: number; count: number }> {
    try {
      // Fetch all approved reviews for the course, only selecting the rating field
      const reviewsResponse = await this.payload.find({
        collection: 'course-reviews',
        where: {
          course: { equals: courseId },
          status: { equals: 'approved' },
        },
        limit: 0, // Fetch all matching documents
        depth: 0, // No need for related data
        pagination: false, // Disable pagination to get all docs
      });

      const reviews = reviewsResponse.docs;
      const count = reviews.length;

      if (count === 0) {
        return { average: 0, count: 0 };
      }

      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      const average = totalRating / count;

      // Optional: Update the Course document with the average rating (consider hooks for this)
      // await this.payload.update({ collection: 'courses', id: courseId, data: { averageRating: average }});

      return { average: parseFloat(average.toFixed(1)), count }; // Return average rounded to one decimal place
    } catch (error) {
      console.error(`Error calculating average rating for course ${courseId}:`, error);
      throw new Error('Failed to calculate average rating.');
    }
  }
}

/**
 * Creates an instance of the review service.
 */
export async function getReviewService(): Promise<ReviewService> {
  const payload = await getPayloadClient()
  return new ReviewService(payload)
}
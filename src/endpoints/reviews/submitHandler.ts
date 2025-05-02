import type { PayloadRequest } from 'payload'
import type { Response, NextFunction } from 'express'
import { getReviewService } from '@/services/courses/reviewService' // Adjust path if needed

export default async function submitReviewHandler(
  req: PayloadRequest,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  const { user, payload, body } = req

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  // Define expected body shape and cast req.body
  interface SubmitReviewRequestBody {
    courseId?: string;
    enrollmentId?: string;
    rating?: number;
    reviewText?: string;
  }
  const { courseId, enrollmentId, rating, reviewText } = body as SubmitReviewRequestBody;

  // Basic validation
  if (!courseId || !enrollmentId || rating === undefined) {
    return res.status(400).json({ message: 'Missing required fields: courseId, enrollmentId, rating' })
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
     return res.status(400).json({ message: 'Invalid rating value. Must be a number between 1 and 5.' })
  }

  try {
    const reviewService = await getReviewService()
    const newReview = await reviewService.submitReview({
      userId: user.id,
      courseId,
      enrollmentId,
      rating,
      reviewText,
    })
    return res.status(201).json(newReview)
  } catch (error: unknown) {
    payload.logger.error(`Error submitting review: ${error instanceof Error ? error.message : 'Unknown error'}`, error)
    // Send specific error messages back to the client if needed
    if (error instanceof Error && (error.message.includes('Invalid enrollment') || error.message.includes('already submitted'))) {
        return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to submit review.' })
  }
}
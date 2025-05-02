import type { PayloadRequest } from 'payload'
import type { Response, NextFunction } from 'express'
import { getReviewService } from '@/services/courses/reviewService' // Adjust path if needed

export default async function getAverageRatingHandler(
  // Add 'params' to PayloadRequest type if not already present in your project's typings
  req: PayloadRequest & { params: { courseId: string } },
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  const { payload, params } = req
  const { courseId } = params

  if (!courseId) {
    return res.status(400).json({ message: 'Missing required parameter: courseId' })
  }

  try {
    const reviewService = await getReviewService()
    const ratingData = await reviewService.calculateAverageRating(courseId)
    return res.status(200).json(ratingData)
  } catch (error: unknown) {
    payload.logger.error(`Error calculating average rating for course ${courseId}: ${error instanceof Error ? error.message : 'Unknown error'}`, error)
    return res.status(500).json({ message: 'Failed to calculate average rating.' })
  }
}
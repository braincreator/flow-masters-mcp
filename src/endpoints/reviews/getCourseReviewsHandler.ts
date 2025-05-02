import type { PayloadRequest } from 'payload'
import type { Response, NextFunction } from 'express'
import { getReviewService } from '@/services/courses/reviewService' // Adjust path if needed

export default async function getCourseReviewsHandler(
  // Add 'params' to PayloadRequest type if not already present in your project's typings
  req: PayloadRequest & { params: { courseId: string }, query: { page?: string, limit?: string } },
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  const { payload, params, query } = req
  const { courseId } = params

  if (!courseId) {
    return res.status(400).json({ message: 'Missing required parameter: courseId' })
  }

  const page = query.page ? parseInt(query.page, 10) : 1;
  const limit = query.limit ? parseInt(query.limit, 10) : 10;

  if (isNaN(page) || page < 1) {
    return res.status(400).json({ message: 'Invalid page parameter. Must be a positive integer.' });
  }
  if (isNaN(limit) || limit < 1 || limit > 100) { // Add a reasonable upper limit
    return res.status(400).json({ message: 'Invalid limit parameter. Must be an integer between 1 and 100.' });
  }

  try {
    const reviewService = await getReviewService()
    const reviewsData = await reviewService.getReviewsForCourse(courseId, page, limit)
    return res.status(200).json(reviewsData)
  } catch (error: unknown) {
    payload.logger.error(`Error fetching reviews for course ${courseId}: ${error instanceof Error ? error.message : 'Unknown error'}`, error)
    return res.status(500).json({ message: 'Failed to fetch reviews.' })
  }
}
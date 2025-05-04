import type { NextApiRequest, NextApiResponse } from 'next'
import { getPayloadClient } from '@/utilities/payload/index'
// Removed unused Course type and Payload import
import { CourseService } from '../../services/courses/courseService' // Import the service

// Basic security check - replace with a more robust method if needed
const SECRET_KEY = process.env.UPDATE_STATUS_SECRET_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow GET or POST, but POST is generally preferred for actions
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  // --- Security Check ---
  // Check for a secret key in headers or query params
  const providedKey = req.headers['x-update-key'] || req.query.secret
  if (!SECRET_KEY || providedKey !== SECRET_KEY) {
    console.warn('Update course statuses: Unauthorized attempt.')
    return res.status(401).json({ error: 'Unauthorized' })
  }
  // --- End Security Check ---

  try {
    const payload = await getPayloadClient()
    const courseService = new CourseService(payload)

    // Call the service function to update statuses
    const { updatedCount, errors } = await courseService.updateAllCourseBookingStatuses()

    // Log any errors encountered during the update
    if (errors.length > 0) {
      console.warn(`Course status update encountered ${errors.length} errors. Check service logs for details.`);
      // Optionally include error details in the response if needed for debugging,
      // but be cautious about exposing sensitive information.
      // return res.status(207).json({ success: true, updatedCount, errors }); // Multi-Status response
    }

    console.log(`API: Course status update complete. Updated ${updatedCount} courses.`)
    return res.status(200).json({ success: true, updatedCount, errorsEncountered: errors.length })
  } catch (error) {
    console.error('Error updating course statuses:', error)
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    return res.status(500).json({ success: false, error: message })
  }
}
import type { PayloadRequest } from 'payload'
import type { Response, NextFunction } from 'express'
import { EnrollmentService } from '@/services/courses/enrollmentService' // Adjust path if needed

// Assuming ServiceRegistry setup allows getting EnrollmentService easily
// If not, you might need getPayloadClient and instantiate directly
import { ServiceRegistry } from '@/services/service.registry'

export default async function cancelEnrollmentHandler(
  // Add 'params' to PayloadRequest type if not already present
  req: PayloadRequest & { params: { enrollmentId: string } },
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  const { user, payload, params } = req

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { enrollmentId } = params

  if (!enrollmentId) {
    return res.status(400).json({ message: 'Missing required parameter: enrollmentId' })
  }

  try {
    // Get enrollment service instance
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    if (!serviceRegistry) {
        throw new Error('ServiceRegistry not initialized');
    }
    const enrollmentService = serviceRegistry.getEnrollmentService();
     if (!enrollmentService) {
        throw new Error('EnrollmentService not available');
    }


    const updatedEnrollment = await enrollmentService.requestEnrollmentCancellation(user.id, enrollmentId)

    if (!updatedEnrollment) {
        // This case might not be reachable if service throws errors, but handle defensively
        return res.status(404).json({ message: 'Enrollment not found or cancellation failed.' });
    }

    return res.status(200).json({ message: 'Enrollment cancellation processed.', status: updatedEnrollment.status })
  } catch (error: unknown) {
    payload.logger.error(`Error processing enrollment cancellation for ${enrollmentId}: ${error instanceof Error ? error.message : 'Unknown error'}`, error)
    // Return specific eligibility errors
    if (error instanceof Error && (error.message.includes('not found') || error.message.includes('Cannot cancel') || error.message.includes('window') || error.message.includes('progress'))) {
        return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to process cancellation request.' })
  }
}
import { PayloadRequest } from 'payload'
import { Response, NextFunction } from 'express'
import { CourseEnrollment, Certificate } from '@/payload-types' // Import types

export async function profileDataHandler(req: PayloadRequest, res: Response, next: NextFunction): Promise<Response | void> {
  const { payload, user } = req

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' })
  }

  try {
    // Fetch user's course enrollments with course details populated
    const enrollmentsResult = await payload.find({
      collection: 'course-enrollments',
      where: {
        user: { equals: user.id },
        // Optionally filter by status (e.g., active, completed)
        // status: { in: ['active', 'completed'] },
      },
      depth: 2, // Depth 2 to populate course -> product potentially
      limit: 1000, // Adjust limit as needed
      sort: '-enrolledAt',
    })
    const enrollments = enrollmentsResult.docs as CourseEnrollment[] // Cast for type safety

    // Fetch user's certificates with course details populated
    const certificatesResult = await payload.find({
      collection: 'certificates',
      where: {
        user: { equals: user.id },
        status: { equals: 'active' }, // Only show active certificates
      },
      depth: 1, // Depth 1 to populate course
      limit: 100, // Adjust limit as needed
      sort: '-issueDate',
    })
    const certificates = certificatesResult.docs as Certificate[] // Cast for type safety

    // Combine data for the response
    const profileData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp, // Include XP and Level if needed
        level: user.level,
        // Add other relevant user fields
      },
      enrollments,
      certificates,
    }

    return res.status(200).json(profileData)

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    payload.logger.error(`Error fetching profile data for user ${user.id}: ${message}`, error)
    return res.status(500).json({ message: 'An error occurred while fetching profile data.' })
  }
}

export default profileDataHandler;
import { Payload } from 'payload'
import { User } from '@/payload-types'
import { ServiceRegistry } from '../service.registry'

export interface EnrollmentData {
  userId: string
  courseId: string
  source?: 'purchase' | 'admin' | 'promotion' | 'subscription'
  orderId?: string
  expiresAt?: string
  notes?: string
}

export interface CertificateData {
  userId: string
  userName: string
  courseId: string
  courseTitle: string
  completionDate: string
  certificateId: string
  instructorName?: string
  instructorSignature?: string
}

export class EnrollmentService {
  private payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  /**
   * Enrolls a user in a course
   */
  async enrollUserInCourse(data: EnrollmentData): Promise<any> {
    try {
      // Check if user is already enrolled
      const existingEnrollment = await this.payload.find({
        collection: 'course-enrollments',
        where: {
          and: [
            {
              user: {
                equals: data.userId,
              },
            },
            {
              course: {
                equals: data.courseId,
              },
            },
            {
              status: {
                not_equals: 'revoked',
              },
            },
          ],
        },
      })

      // If user is already enrolled and enrollment is active, return it
      if (existingEnrollment.docs.length > 0) {
        const enrollment = existingEnrollment.docs[0]
        if (enrollment.status === 'active' || enrollment.status === 'completed') {
          return enrollment
        }

        // If enrollment exists but is expired, update it
        return await this.payload.update({
          collection: 'course-enrollments',
          id: enrollment.id,
          data: {
            status: 'active',
            enrolledAt: new Date().toISOString(),
            expiresAt: data.expiresAt,
            source: data.source || 'admin',
            orderId: data.orderId,
            notes: data.notes,
          },
        })
      }

      // Create new enrollment
      const enrollment = await this.payload.create({
        collection: 'course-enrollments',
        data: {
          user: data.userId,
          course: data.courseId,
          status: 'active',
          enrolledAt: new Date().toISOString(),
          expiresAt: data.expiresAt,
          progress: 0,
          source: data.source || 'admin',
          orderId: data.orderId,
          notes: data.notes,
        },
      })

      // Track enrollment event in analytics and achievements
      try {
        const serviceRegistry = ServiceRegistry.getInstance(this.payload)
        if (serviceRegistry) {
          // Track achievement event
          const achievementService = serviceRegistry.getAchievementService()
          await achievementService.processEvent({
            userId: data.userId,
            courseId: data.courseId,
            eventType: 'course.started',
          })

          // Send enrollment email
          try {
            // Get user details
            const user = await this.payload.findByID({
              collection: 'users',
              id: data.userId,
            })

            // Get course details
            const course = await this.payload.findByID({
              collection: 'courses',
              id: data.courseId,
            })

            // Send enrollment email
            const emailService = serviceRegistry.getEmailService()
            await emailService.sendCourseEnrollmentEmail({
              userName: user.name || 'Student',
              email: user.email,
              courseName: course.title,
              courseId: data.courseId,
              locale: user.locale || 'ru',
              expiresAt: data.expiresAt,
              isPaid: data.source === 'purchase',
              orderNumber: data.orderId,
            })
          } catch (emailError) {
            console.error('Error sending enrollment email:', emailError)
          }
        }
      } catch (error) {
        console.error('Error tracking enrollment event:', error)
      }

      return enrollment
    } catch (error) {
      console.error('Error enrolling user in course:', error)
      throw error
    }
  }

  /**
   * Checks if a user has access to a course
   */
  async hasAccessToCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      // Get the course to check access type
      const course = await this.payload.findByID({
        collection: 'courses',
        id: courseId,
      })

      // If course is free, everyone has access
      if (course.accessType === 'free') {
        return true
      }

      // If course requires subscription, check if user has active subscription
      if (course.accessType === 'subscription') {
        // Check if user has active subscription
        const subscriptions = await this.payload.find({
          collection: 'subscriptions',
          where: {
            and: [
              {
                user: {
                  equals: userId,
                },
              },
              {
                status: {
                  equals: 'active',
                },
              },
            ],
          },
        })

        if (subscriptions.docs.length > 0) {
          return true
        }
      }

      // For paid courses, check if user is enrolled
      const enrollments = await this.payload.find({
        collection: 'course-enrollments',
        where: {
          and: [
            {
              user: {
                equals: userId,
              },
            },
            {
              course: {
                equals: courseId,
              },
            },
            {
              status: {
                equals: 'active',
              },
            },
          ],
        },
      })

      // Check if enrollment exists and is not expired
      if (enrollments.docs.length > 0) {
        const enrollment = enrollments.docs[0]

        // If no expiration date, access is unlimited
        if (!enrollment.expiresAt) {
          return true
        }

        // Check if enrollment is expired
        const now = new Date()
        const expiresAt = new Date(enrollment.expiresAt)

        return now < expiresAt
      }

      // If admin, always has access
      const user = (await this.payload.findByID({
        collection: 'users',
        id: userId,
      })) as User

      if (user.role === 'admin') {
        return true
      }

      return false
    } catch (error) {
      console.error('Error checking course access:', error)
      return false
    }
  }

  /**
   * Gets all courses a user has access to
   */
  async getUserCourses(userId: string): Promise<any[]> {
    try {
      // Get all active enrollments for the user
      const enrollments = await this.payload.find({
        collection: 'course-enrollments',
        where: {
          and: [
            {
              user: {
                equals: userId,
              },
            },
            {
              status: {
                equals: 'active',
              },
            },
          ],
        },
        depth: 1, // Include course data
      })

      // Get free courses
      const freeCourses = await this.payload.find({
        collection: 'courses',
        where: {
          and: [
            {
              accessType: {
                equals: 'free',
              },
            },
            {
              status: {
                equals: 'published',
              },
            },
          ],
        },
      })

      // Combine enrolled courses with free courses
      const enrolledCourseIds = enrollments.docs.map((enrollment) => {
        // Handle both populated and non-populated course fields
        return typeof enrollment.course === 'object' && enrollment.course !== null
          ? enrollment.course.id
          : enrollment.course
      })

      const allAccessibleCourses = [
        ...enrollments.docs.map((enrollment) => {
          // Return the course object if it's populated, otherwise it's just the ID
          return typeof enrollment.course === 'object' && enrollment.course !== null
            ? enrollment.course
            : enrollment.course
        }),
        ...freeCourses.docs.filter((course) => !enrolledCourseIds.includes(course.id)),
      ]

      return allAccessibleCourses
    } catch (error) {
      console.error('Error getting user courses:', error)
      return []
    }
  }

  /**
   * Updates user progress in a course
   */
  async updateCourseProgress(userId: string, courseId: string, progress: number): Promise<any> {
    try {
      // Find the enrollment
      const enrollments = await this.payload.find({
        collection: 'course-enrollments',
        where: {
          and: [
            {
              user: {
                equals: userId,
              },
            },
            {
              course: {
                equals: courseId,
              },
            },
            {
              status: {
                equals: 'active',
              },
            },
          ],
        },
      })

      if (enrollments.docs.length === 0) {
        throw new Error('User is not enrolled in this course')
      }

      const enrollment = enrollments.docs[0]

      // Update progress
      const updatedEnrollment = await this.payload.update({
        collection: 'course-enrollments',
        id: enrollment.id,
        data: {
          progress: Math.min(100, Math.max(0, progress)),
          lastAccessedAt: new Date().toISOString(),
        },
      })

      // Track progress achievement
      try {
        const serviceRegistry = ServiceRegistry.getInstance(this.payload)
        if (serviceRegistry) {
          const achievementService = serviceRegistry.getAchievementService()
          await achievementService.processEvent({
            userId,
            courseId,
            eventType: 'course.progress',
            value: Math.min(100, Math.max(0, progress)),
          })

          // Send progress milestone emails at 25%, 50%, and 75%
          const previousProgress = enrollment.progress || 0
          const currentProgress = Math.min(100, Math.max(0, progress))

          // Check if we've crossed a milestone
          const milestones = [25, 50, 75]
          for (const milestone of milestones) {
            if (previousProgress < milestone && currentProgress >= milestone) {
              try {
                // Get user details
                const user = await this.payload.findByID({
                  collection: 'users',
                  id: userId,
                })

                // Get course details
                const course = await this.payload.findByID({
                  collection: 'courses',
                  id: courseId,
                })

                // Get next lesson if available
                let nextLessonName = ''
                let nextLessonUrl = ''

                try {
                  // This is a simplified example - you would need to implement
                  // logic to find the next unfinished lesson
                  const lessons = await this.payload.find({
                    collection: 'lessons',
                    where: {
                      course: {
                        equals: courseId,
                      },
                    },
                    sort: 'order',
                    limit: 1,
                  })

                  if (lessons.docs.length > 0) {
                    const nextLesson = lessons.docs[0]
                    nextLessonName = nextLesson.title
                    nextLessonUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${user.locale || 'ru'}/courses/${courseId}/learn/${nextLesson.id}`
                  }
                } catch (lessonError) {
                  console.error('Error finding next lesson:', lessonError)
                }

                // Send progress email
                const emailService = serviceRegistry.getEmailService()
                await emailService.sendCourseProgressEmail({
                  userName: user.name || 'Student',
                  email: user.email,
                  courseName: course.title,
                  courseId: courseId,
                  progressPercentage: milestone,
                  locale: user.locale || 'ru',
                  nextLessonName,
                  nextLessonUrl,
                })
              } catch (emailError) {
                console.error(`Error sending ${milestone}% progress email:`, emailError)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error tracking progress achievement:', error)
      }

      // If progress is 100%, mark as completed
      if (progress >= 100) {
        await this.payload.update({
          collection: 'course-enrollments',
          id: enrollment.id,
          data: {
            status: 'completed',
            completedAt: new Date().toISOString(),
          },
        })

        // Track completion event and achievements
        try {
          const serviceRegistry = ServiceRegistry.getInstance(this.payload)
          if (serviceRegistry) {
            // Track course completion achievement
            const achievementService = serviceRegistry.getAchievementService()
            await achievementService.processEvent({
              userId,
              courseId,
              eventType: 'course.completed',
              value: 100,
            })

            // Send course completion email
            try {
              // Get user details
              const user = await this.payload.findByID({
                collection: 'users',
                id: userId,
              })

              // Get course details
              const course = await this.payload.findByID({
                collection: 'courses',
                id: courseId,
              })

              // Find next recommended course if available
              let nextCourseId = ''
              let nextCourseName = ''

              try {
                // This is a simplified example - you would need to implement
                // logic to find the next recommended course
                const recommendedCourses = await this.payload.find({
                  collection: 'courses',
                  where: {
                    id: {
                      not_equals: courseId,
                    },
                    status: {
                      equals: 'published',
                    },
                  },
                  limit: 1,
                })

                if (recommendedCourses.docs.length > 0) {
                  const nextCourse = recommendedCourses.docs[0]
                  nextCourseId = nextCourse.id
                  nextCourseName = nextCourse.title
                }
              } catch (courseError) {
                console.error('Error finding next course:', courseError)
              }

              // Generate certificate
              const certificate = await this.generateCertificate(userId, courseId)

              // Send completion email
              const emailService = serviceRegistry.getEmailService()
              await emailService.sendCourseCompletionEmail({
                userName: user.name || 'Student',
                email: user.email,
                courseName: course.title,
                courseId: courseId,
                certificateId: certificate?.certificateId,
                completionDate: new Date().toISOString(),
                locale: user.locale || 'ru',
                nextCourseId,
                nextCourseName,
              })

              // Also send certificate email
              if (certificate) {
                await emailService.sendCourseCertificateEmail({
                  userName: user.name || 'Student',
                  email: user.email,
                  courseName: course.title,
                  courseId: courseId,
                  certificateId: certificate.certificateId,
                  completionDate: new Date().toISOString(),
                  locale: user.locale || 'ru',
                })
              }
            } catch (emailError) {
              console.error('Error sending completion email:', emailError)
            }
          }
        } catch (error) {
          console.error('Error tracking completion event:', error)
        }
      }

      return updatedEnrollment
    } catch (error) {
      console.error('Error updating course progress:', error)
      throw error
    }
  }

  /**
   * Revokes a user's access to a course
   */
  async revokeCourseAccess(userId: string, courseId: string, reason?: string): Promise<any> {
    try {
      // Find the enrollment
      const enrollments = await this.payload.find({
        collection: 'course-enrollments',
        where: {
          and: [
            {
              user: {
                equals: userId,
              },
            },
            {
              course: {
                equals: courseId,
              },
            },
            {
              status: {
                not_equals: 'revoked',
              },
            },
          ],
        },
      })

      if (enrollments.docs.length === 0) {
        throw new Error('User is not enrolled in this course')
      }

      const enrollment = enrollments.docs[0]

      // Update enrollment status
      return await this.payload.update({
        collection: 'course-enrollments',
        id: enrollment.id,
        data: {
          status: 'revoked',
          notes: reason ? `${enrollment.notes || ''}\n\nRevoked: ${reason}` : enrollment.notes,
        },
      })
    } catch (error) {
      console.error('Error revoking course access:', error)
      throw error
    }
  }

  /**
   * Generates a certificate for a completed course
   */
  async generateCertificate(userId: string, courseId: string): Promise<any> {
    try {
      // Check if user has completed the course
      const enrollments = await this.payload.find({
        collection: 'course-enrollments',
        where: {
          and: [
            {
              user: {
                equals: userId,
              },
            },
            {
              course: {
                equals: courseId,
              },
            },
            {
              status: {
                equals: 'completed',
              },
            },
          ],
        },
      })

      if (enrollments.docs.length === 0) {
        throw new Error('User has not completed this course')
      }

      const enrollment = enrollments.docs[0]

      // Get user details
      const user = await this.payload.findByID({
        collection: 'users',
        id: userId,
      })

      // Get course details
      const course = await this.payload.findByID({
        collection: 'courses',
        id: courseId,
      })

      // Check if certificate already exists
      const existingCertificates = await this.payload.find({
        collection: 'certificates',
        where: {
          and: [
            {
              user: {
                equals: userId,
              },
            },
            {
              course: {
                equals: courseId,
              },
            },
          ],
        },
      })

      // If certificate already exists, return it
      if (existingCertificates.docs.length > 0) {
        return existingCertificates.docs[0]
      }

      // Generate a unique certificate ID
      const certificateId = `CERT-${courseId.substring(0, 8)}-${userId.substring(0, 8)}-${Date.now().toString(36)}`

      // Create certificate
      const certificate = await this.payload.create({
        collection: 'certificates',
        data: {
          certificateId,
          user: userId,
          userName: user.name || 'Student',
          course: courseId,
          courseTitle: course.title,
          completionDate: enrollment.completedAt || new Date().toISOString(),
          issueDate: new Date().toISOString(),
          instructor: course.instructor || null,
          status: 'active',
        },
      })

      // Track certificate generation in achievements
      try {
        const serviceRegistry = ServiceRegistry.getInstance(this.payload)
        if (serviceRegistry) {
          const achievementService = serviceRegistry.getAchievementService()
          await achievementService.processEvent({
            userId,
            courseId,
            eventType: 'course.completed',
            metadata: {
              certificateId,
              certificateUrl: `/certificates/${certificate.id}`,
            },
          })
        }
      } catch (error) {
        console.error('Error tracking certificate generation:', error)
      }

      return certificate
    } catch (error) {
      console.error('Error generating certificate:', error)
      throw error
    }
  }

  /**
   * Gets all certificates for a user
   */
  async getUserCertificates(userId: string): Promise<any[]> {
    try {
      const certificates = await this.payload.find({
        collection: 'certificates',
        where: {
          user: {
            equals: userId,
          },
        },
        depth: 1, // Include related data
      })

      return certificates.docs
    } catch (error) {
      console.error('Error getting user certificates:', error)
      return []
    }
  }
}

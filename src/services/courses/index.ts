import { getPayloadClient } from '@/utilities/payload'
import { CourseService } from './courseService'
import { EnrollmentService } from './enrollmentService'
import { ServiceRegistry } from '../service.registry'

export async function getCourseService(): Promise<CourseService> {
  const payload = await getPayloadClient()
  return new CourseService(payload)
}

export async function getEnrollmentService(): Promise<EnrollmentService> {
  const payload = await getPayloadClient()
  const serviceRegistry = ServiceRegistry.getInstance(payload)
  return serviceRegistry.getEnrollmentService()
}

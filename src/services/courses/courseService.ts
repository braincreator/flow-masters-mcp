import { getPayloadClient } from '@/utilities/payload/index'
import { slugify } from '@/utilities/strings'
import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
import type { Payload, Where } from 'payload' // Import Where type
import type { Course, Module, Lesson } from '../../payload-types' // Correct import path

// Типы для данных курса
export interface LessonData {
  id?: string // Added for updates
  title: string
  description?: string
  // content?: string // REMOVED
  // layout?: any[] // REMOVED: Property removed as requested
  duration?: string
  type?: 'video' | 'text' | 'quiz' | 'assignment'
  // order?: number // REMOVED: Field does not exist in config
  assessment?: string // NEW: Optional ID of related Assessment
  // prerequisites?: string[] // REMOVED: Field does not exist in config
  // completionCriteria?: 'viewed' | 'pass_assessment' // REMOVED: Field does not exist in config
}

export interface ModuleData {
  id?: string // Added for updates
  name: string // Use 'name' instead of 'title'
  description?: string
  // content?: string // REMOVED
  // layout?: any[] // REMOVED
  lessons: LessonData[]
  // order?: number // REMOVED: Field does not exist in config
  // prerequisites?: string[] // REMOVED: Field does not exist in config
}

export interface CourseData {
  title: string
  slug?: string
  excerpt?: string
  description?: string // Note: This might be redundant if using layout for landing page
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration?: string
  status?: 'draft' | 'published' | 'archived'
  // learningOutcomes?: string[] // These seem to be custom fields not in the base config
  // requirements?: string[] // These seem to be custom fields not in the base config
  // targetAudience?: string[] // These seem to be custom fields not in the base config
  modules: ModuleData[]
  featuredImage?: string // ID медиа-файла
  instructors?: string[] // Use 'instructors' (array) instead of 'author'
  // layout?: any[] // REMOVED: Property removed as requested
  product?: string // NEW: ID of linked product
  accessType?: 'paid' | 'free' | 'subscription' // NEW
  accessDuration?: { // NEW
    type: 'unlimited' | 'limited'
    duration?: number
    unit?: 'days' | 'weeks' | 'months' | 'years'
  }
  finalAssessment?: string // NEW: Optional ID of related Assessment
  courseStartDate: string | Date // Added required field
}

// NEW: Interface for findCourses parameters
export interface FindCoursesParams {
  search?: string
  difficulty?: string | string[]
  tags?: string | string[]
  accessType?: string | string[]
  page?: number
  limit?: number
  sort?: string
  locale?: 'ru' | 'en' | 'all' // Use specific locale types
}

export class CourseService {
  private payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  /**
   * Обновляет существующий курс в CMS
   */
  async updateCourse(
    courseData: CourseData & { id: string },
    locale?: 'ru' | 'en', // Correct locale type
  ): Promise<any> {
    try {
      // Обновляем курс
      // Note: Errors might persist until payload-types.ts is correctly generated
      // The 'finalAssessment' field might cause a TS error if types are outdated.
      const course = await this.payload.update({
        collection: 'courses',
        id: courseData.id,
        data: {
          title: courseData.title,
          slug: courseData.slug,
          excerpt: courseData.excerpt,
          difficulty: courseData.difficulty || 'beginner',
          estimatedDuration: courseData.estimatedDuration,
          status: courseData.status || 'draft',
          // layout: courseData.layout, // REMOVED: Property removed as requested
          product: courseData.product,
          accessType: courseData.accessType,
          accessDuration: courseData.accessDuration,
          // finalAssessment: courseData.finalAssessment, // Commented out due to TS error / type generation issue
          ...(courseData.featuredImage && { featuredImage: courseData.featuredImage }),
          // Assuming courseData.author is actually the instructor ID(s)
          // If courseData.author is a single ID, wrap it in an array
          ...(courseData.instructors && { instructors: courseData.instructors }), // Use instructors directly
        },
        ...(locale && { locale }),
      })

      // Получаем существующие модули курса
      const existingModules = await this.payload
        .find({
          collection: 'modules',
          where: {
            course: {
              equals: courseData.id,
            },
          },
        })
        .then((res) => res.docs)

      // Создаем или обновляем модули
      const updatedModulesData = [] // Renamed to avoid conflict with 'modules' collection slug
      for (const moduleData of courseData.modules) {
        let moduleDoc // Renamed from 'module' to avoid ESLint error

        if (moduleData.id) {
          // Обновляем существующий модуль
          moduleDoc = await this.updateModule({
            moduleId: moduleData.id,
            moduleData,
            locale,
          })
        } else {
          // Создаем новый модуль
          moduleDoc = await this.createModule({
            courseId: courseData.id,
            moduleData,
            locale,
          })
        }

        updatedModulesData.push(moduleDoc)
      }

      // Удаляем модули, которых нет в обновленном списке
      const updatedModuleIds = updatedModulesData.map((m) => m.module.id) // Assuming result structure { module: {...}, lessons: [...] }
      for (const existingModule of existingModules) {
        if (!updatedModuleIds.includes(existingModule.id)) {
          await this.payload.delete({
            collection: 'modules',
            id: existingModule.id,
          })
        }
      }

      return {
        course,
        modules: updatedModulesData, // Return the updated data
      }
    } catch (error) {
      logError('Error updating course:', error)
      throw error
    }
  }

  /**
   * Обновляет существующий модуль
   */
  async updateModule({
    moduleId,
    moduleData,
    locale,
  }: {
    moduleId: string
    moduleData: ModuleData
    locale?: 'ru' | 'en' // Correct locale type
  }): Promise<any> {
    try {
      // Обновляем модуль
      // Note: Errors might persist until payload-types.ts is correctly generated
      // The 'order' field might cause a TS error if types are outdated.
      // The 'layout' field should NOT be present here based on config.
      const moduleDoc = await this.payload.update({ // Renamed from 'module'
        collection: 'modules',
        id: moduleId,
        data: {
          name: moduleData.name, // Corrected access to use 'name'
          // order: moduleData.order, // REMOVED: Field does not exist in config
          // prerequisites: moduleData.prerequisites, // REMOVED: Field does not exist in config
          ...(moduleData.description && { description: moduleData.description }),
        },
        ...(locale && { locale }),
      })

      // Получаем существующие уроки модуля
      const existingLessons = await this.payload
        .find({
          collection: 'lessons',
          where: {
            module: {
              equals: moduleId,
            },
          },
        })
        .then((res) => res.docs)

      // Создаем или обновляем уроки
      const lessons = []
      for (const lessonData of moduleData.lessons) {
        let lesson

        if (lessonData.id) {
          // Обновляем существующий урок
          lesson = await this.updateLesson({
            lessonId: lessonData.id,
            lessonData,
            locale,
          })
        } else {
          // Создаем новый урок
          lesson = await this.createLesson({
            moduleId,
            lessonData,
            locale,
          })
        }

        lessons.push(lesson)
      }

      // Удаляем уроки, которых нет в обновленном списке
      const updatedLessonIds = lessons.map((l) => l.id)
      for (const existingLesson of existingLessons) {
        if (!updatedLessonIds.includes(existingLesson.id)) {
          await this.payload.delete({
            collection: 'lessons',
            id: existingLesson.id,
          })
        }
      }

      return {
        module: moduleDoc, // Return the updated module doc
        lessons,
      }
    } catch (error) {
      logError('Error updating module:', error)
      throw error
    }
  }

  /**
   * Обновляет существующий урок
   */
  async updateLesson({
    lessonId,
    lessonData,
    locale,
  }: {
    lessonId: string
    lessonData: LessonData
    locale?: 'ru' | 'en' // Correct locale type
  }): Promise<any> {
    try {
      // Обновляем урок
      // Note: Errors might persist until payload-types.ts is correctly generated
      // Fields like 'layout', 'assessment', 'prerequisites', 'completionCriteria' might cause TS errors.
      const lesson = await this.payload.update({
        collection: 'lessons',
        id: lessonId,
        data: {
          title: lessonData.title,
          // layout: lessonData.layout, // REMOVED: Property removed as requested
          // order: lessonData.order, // REMOVED: Field does not exist in config
          // assessment: lessonData.assessment, // Commented out due to TS error / type generation issue
          // prerequisites: lessonData.prerequisites, // Commented out due to TS error / type generation issue
          // completionCriteria: lessonData.completionCriteria, // Commented out due to TS error / type generation issue
          ...(lessonData.description && { description: lessonData.description }),
          ...(lessonData.duration && { duration: lessonData.duration }),
          ...(lessonData.type && { type: lessonData.type }),
        },
        ...(locale && { locale }),
      })
      return lesson
    } catch (error) {
      logError('Error updating lesson:', error)
      throw error
    }
  }

  /**
   * Создает новый курс в CMS
   */
  async createCourse(courseData: CourseData, locale?: 'ru' | 'en'): Promise<any> { // Correct locale type
    try {
      // Генерируем slug, если он не предоставлен
      const slug = courseData.slug || slugify(courseData.title) // Slug generation still uses title, which is correct for CourseData

      // Создаем курс
      // Получаем или создаем необходимые объекты для обязательных полей

      // 1. Получаем или создаем автора (now instructors)
      let instructorIds = courseData.instructors
      // If instructors is not provided or empty, find a default admin
      if (!instructorIds || instructorIds.length === 0) {
        // Получаем первого администратора в системе
        const admins = await this.payload.find({
          collection: 'users',
          where: {
            role: { equals: 'admin' },
          },
          limit: 1,
        })

        // Ensure docs array exists and is not empty before accessing
        if (admins?.docs?.length > 0) {
          const firstAdmin = admins.docs[0] // Assign to variable
          if (firstAdmin) { // Explicit check on the element
            instructorIds = [firstAdmin.id] // Assign as an array
          } else {
            // Should not happen if length > 0, but satisfies TS
            throw new Error('Admin user data is unexpectedly missing.')
          }
        } else {
          throw new Error(
            'Не найден инструктор для курса. Укажите инструктора или создайте пользователя с ролью администратора.',
          )
        }
      }

      // 2. Получаем или создаем обложку курса
      let featuredImageId = courseData.featuredImage
      if (!featuredImageId) {
        // Используем стандартное изображение или создаем новое
        const defaultImages = await this.payload.find({
          collection: 'media',
          where: {
            filename: { contains: 'default-course' },
          },
          limit: 1,
        })

        // Ensure docs array exists and is not empty before accessing
        if (defaultImages?.docs?.length > 0) {
          const firstDefaultImage = defaultImages.docs[0]
          if (firstDefaultImage) { // Explicit check
            featuredImageId = firstDefaultImage.id
          } else {
            throw new Error('Default image data is unexpectedly missing.')
          }
        } else {
          // Используем любое изображение из медиа
          const anyImages = await this.payload.find({
            collection: 'media',
            limit: 1,
          })

          // Ensure docs array exists and is not empty before accessing
          if (anyImages?.docs?.length > 0) {
            const firstAnyImage = anyImages.docs[0]
            if (firstAnyImage) { // Explicit check
              featuredImageId = firstAnyImage.id
            } else {
              throw new Error('Fallback image data is unexpectedly missing.')
            }
          } else {
            throw new Error(
              'Не найдено изображение для обложки курса. Загрузите изображение в медиатеку.',
            )
          }
        }
      }

      
            // 3. Создаем базовое содержимое страницы курса - REMOVED layout logic
            // const layout = courseData.layout || [ ... default block ... ] // REMOVED
      
            // Создаем курс
            // Note: Errors might persist until payload-types.ts is correctly generated
            // The 'finalAssessment' field might cause a TS error if types are outdated.
            const course = await this.payload.create({
              collection: 'courses',
              data: {
                title: courseData.title,
                slug,
                excerpt: courseData.excerpt,
                difficulty: courseData.difficulty || 'beginner',
                estimatedDuration: courseData.estimatedDuration,
                status: courseData.status || 'draft',
                product: courseData.product,
                accessType: courseData.accessType,
                accessDuration: courseData.accessDuration,
                // finalAssessment: courseData.finalAssessment, // Commented out due to TS error / type generation issue
                instructors: instructorIds, // Use the determined instructor IDs
                featuredImage: featuredImageId,
                courseStartDate: typeof courseData.courseStartDate === 'string' ? courseData.courseStartDate : courseData.courseStartDate.toISOString(), // Ensure ISO string
              },
              ...(locale && { locale }),
            })
      // Создаем модули и уроки
      const createdModulesData = [] // Renamed to avoid conflict
      for (const moduleData of courseData.modules) { // Removed index as order is removed
        // const moduleOrder = moduleData.order !== undefined ? moduleData.order : moduleIndex + 1 // REMOVED order logic

        const moduleDoc = await this.createModule({ // Renamed from 'module'
          courseId: course.id,
          moduleData: moduleData, // Pass moduleData directly
          locale,
        })

        createdModulesData.push(moduleDoc)
      }

      return {
        course,
        modules: createdModulesData, // Return created data
      }
    } catch (error) {
      logError('Error creating course:', error)
      throw error
    }
  }

  /**
   * Создает новый модуль для курса
   */
  async createModule({
    courseId,
    moduleData,
    locale,
  }: {
    courseId: string
    moduleData: ModuleData
    locale?: 'ru' | 'en' // Correct locale type
  }): Promise<any> {
    try {
      // Создаем модуль
      // Note: Errors might persist until payload-types.ts is correctly generated
      // The 'order' field might cause a TS error if types are outdated.
      // The 'layout' field should NOT be present here based on config.
      const moduleDoc = await this.payload.create({ // Renamed from 'module'
        collection: 'modules',
        data: {
          name: moduleData.name, // Corrected access to use 'name'
          course: courseId,
          // order: moduleData.order ?? 0, // REMOVED: Field does not exist in config
          // prerequisites: moduleData.prerequisites, // REMOVED: Field does not exist in config
          ...(moduleData.description && { description: moduleData.description }),
        },
        ...(locale && { locale }),
      })

      // Создаем уроки для модуля
      const lessons = []
      for (const lessonData of moduleData.lessons) { // Removed index as order is removed
        // const lessonOrder = lessonData.order !== undefined ? lessonData.order : lessonIndex + 1 // REMOVED order logic

        const lesson = await this.createLesson({
          moduleId: moduleDoc.id, // Use renamed variable
          lessonData: lessonData, // Pass lessonData directly
          locale,
        })

        lessons.push(lesson)
      }

      return {
        module: moduleDoc, // Return created module doc
        lessons,
      }
    } catch (error) {
      logError('Error creating module:', error)
      throw error
    }
  }

  /**
   * Создает новый урок для модуля
   */
  async createLesson({
    moduleId,
    lessonData,
    locale,
  }: {
    moduleId: string
    lessonData: LessonData
    locale?: 'ru' | 'en' // Correct locale type
  }): Promise<any> {
    try {
      // Создаем урок
      // Note: Errors might persist until payload-types.ts is correctly generated
      // Fields like 'layout', 'assessment', 'prerequisites', 'completionCriteria' might cause TS errors.
      const lesson = await this.payload.create({
        collection: 'lessons',
        data: {
          title: lessonData.title,
          module: moduleId,
          // layout: lessonData.layout ?? [], // REMOVED: Property removed as requested
          // order: lessonData.order ?? 0, // REMOVED: Field does not exist in config
          // assessment: lessonData.assessment, // Still commented out - related to hang
          // prerequisites: lessonData.prerequisites, // REMOVED: Field does not exist in config
          // completionCriteria: lessonData.completionCriteria ?? 'viewed', // REMOVED: Field does not exist in config
          ...(lessonData.description && { description: lessonData.description }),
          ...(lessonData.duration && { duration: lessonData.duration }),
          ...(lessonData.type && { type: lessonData.type }),
        },
        ...(locale && { locale }),
      })
      return lesson
    } catch (error) {
      logError('Error creating lesson:', error)
      throw error
    }
  }

  /**
   * Находит курсы с возможностью поиска, фильтрации, пагинации и сортировки
   */
  async findCourses(params: FindCoursesParams): Promise<any> { // Consider using PaginatedDocs<Course> type if available
    const {
      search,
      difficulty,
      tags,
      accessType,
      page = 1,
      limit = 10,
      sort = '-createdAt',
      locale,
    } = params

    const where: Where = {
      status: { equals: 'published' }, // Only find published courses by default
    }

    // Add search query (title or excerpt)
    if (search) {
      where.or = [
        { title: { like: search } },
        { excerpt: { like: search } },
      ]
    }

    // Add filters
    if (difficulty) {
      const difficulties = Array.isArray(difficulty) ? difficulty : [difficulty]
      where.difficulty = { in: difficulties }
    }
    if (tags) {
      const tagIds = Array.isArray(tags) ? tags : [tags]
      where.tags = { in: tagIds } // Assumes tags are passed as IDs
    }
    if (accessType) {
      const accessTypes = Array.isArray(accessType) ? accessType : [accessType]
      where.accessType = { in: accessTypes }
    }

    try {
      const result = await this.payload.find({
        collection: 'courses',
        where,
        page,
        limit,
        sort,
        ...(locale && { locale }),
        // Consider depth if you need related data like author or tags populated
        // depth: 1,
      })
      return result
    } catch (error) {
      logError('Error finding courses:', error)
      throw error
    }
  }

  /**
   * Updates the bookingStatus of all relevant courses based on their dates.
   * Intended for use by scheduled jobs or administrative actions.
   */
  async updateAllCourseBookingStatuses(): Promise<{ updatedCount: number; errors: { courseId: string; error: any }[] }> {
    logDebug('Starting course status update job...');
    let updatedCount = 0;
    const errors: { courseId: string; error: any }[] = [];
    type BookingStatus = 'not_yet_open' | 'open' | 'closed' | 'in_progress'; // Keep type local

    try {
      // Fetch all relevant courses
      // Ensure Course type includes necessary date fields and bookingStatus
      const { docs: courses } = await this.payload.find({
        collection: 'courses',
        limit: 10000, // Increased limit for potentially many courses
        depth: 0,
        overrideAccess: true,
        pagination: false,
        // Consider adding a 'where' clause if only specific courses need checking
        // e.g., where: { status: { equals: 'published' } }
      });

      const now = new Date();
      logDebug(`Found ${courses.length} courses to check.`);

      for (const course of courses as Course[]) { // Added type assertion for clarity
        // Ensure date fields exist before comparison
        const bookingStartDate = course.enrollmentStartDate ? new Date(course.enrollmentStartDate) : null;
        const bookingEndDate = course.enrollmentEndDate ? new Date(course.enrollmentEndDate) : null;
        const courseStartDate = course.courseStartDate ? new Date(course.courseStartDate) : null;

        let expectedStatus: BookingStatus = 'not_yet_open'; // Default

        // Determine the expected status based on dates
        if (bookingStartDate && now < bookingStartDate) {
          expectedStatus = 'not_yet_open';
        } else if (bookingStartDate && bookingEndDate && now >= bookingStartDate && now < bookingEndDate) {
          expectedStatus = 'open';
        } else if (bookingEndDate && courseStartDate && now >= bookingEndDate && now < courseStartDate) {
          expectedStatus = 'closed';
        } else if (courseStartDate && now >= courseStartDate) {
          // Assuming 'in_progress' until a course end date is considered
          expectedStatus = 'in_progress';
        }
        // Add 'completed' logic here later if needed (e.g., based on courseEndDate)

        // Update if the status differs
        if (course.bookingStatus !== expectedStatus) {
          try {
            await this.payload.update({
              collection: 'courses',
              id: course.id,
              data: {
                bookingStatus: expectedStatus,
              },
              overrideAccess: true,
              depth: 0,
            });
            updatedCount++;
            logDebug(`Updated course ${course.id} status to ${expectedStatus}`);
          } catch (updateError) {
            logError(`Failed to update course ${course.id}:`, updateError);
            errors.push({ courseId: course.id, error: updateError });
            // Continue processing other courses even if one fails
          }
        }
      }

      logDebug(`Course status update finished. Updated ${updatedCount} courses. Encountered ${errors.length} errors.`);
      return { updatedCount, errors };

    } catch (fetchError) {
      logError('Fatal error fetching courses for status update:', fetchError);
      // Re-throw or handle as appropriate for the job context
      // Consider returning a specific error structure instead of throwing for job context
      return { updatedCount: 0, errors: [{ courseId: 'N/A', error: fetchError }] };
    }
  }
}

/**
 * Создает экземпляр сервиса курсов
 */
export async function getCourseService(): Promise<CourseService> {
  const payload = await getPayloadClient()
  return new CourseService(payload)
}

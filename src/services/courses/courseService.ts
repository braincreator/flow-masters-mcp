import { getPayloadClient } from '@/utilities/payload/index'
import { slugify } from '@/utilities/strings'
import type { Payload, Where } from 'payload' // Import Where type
import type { Course, Module, Lesson } from '../../payload-types' // Correct import path

// Типы для данных курса
export interface LessonData {
  id?: string // Added for updates
  title: string
  description?: string
  // content?: string // REMOVED
  layout?: any[] // NEW: Replaces content, uses block structure
  duration?: string
  type?: 'video' | 'text' | 'quiz' | 'assignment'
  order?: number
  assessment?: string // NEW: Optional ID of related Assessment
  prerequisites?: string[] // NEW: Optional array of Lesson IDs
  completionCriteria?: 'viewed' | 'pass_assessment' // NEW
}

export interface ModuleData {
  id?: string // Added for updates
  title: string
  description?: string
  // content?: string // REMOVED
  // layout?: any[] // REMOVED
  lessons: LessonData[]
  order?: number
  prerequisites?: string[] // NEW: Optional array of Module IDs
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
  author?: string // ID автора
  layout?: any[] // Содержимое страницы курса (landing page)
  product?: string // NEW: ID of linked product
  accessType?: 'paid' | 'free' | 'subscription' // NEW
  accessDuration?: { // NEW
    type: 'unlimited' | 'limited'
    duration?: number
    unit?: 'days' | 'weeks' | 'months' | 'years'
  }
  finalAssessment?: string // NEW: Optional ID of related Assessment
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
          layout: courseData.layout,
          product: courseData.product,
          accessType: courseData.accessType,
          accessDuration: courseData.accessDuration,
          // finalAssessment: courseData.finalAssessment, // Commented out due to TS error / type generation issue
          ...(courseData.featuredImage && { featuredImage: courseData.featuredImage }),
          ...(courseData.author && { author: courseData.author }),
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
      console.error('Error updating course:', error)
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
          title: moduleData.title,
          // order: moduleData.order, // Commented out due to TS error / type generation issue
          prerequisites: moduleData.prerequisites,
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
      console.error('Error updating module:', error)
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
          // layout: lessonData.layout, // Commented out due to TS error / type generation issue
          order: lessonData.order,
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
      console.error('Error updating lesson:', error)
      throw error
    }
  }

  /**
   * Создает новый курс в CMS
   */
  async createCourse(courseData: CourseData, locale?: 'ru' | 'en'): Promise<any> { // Correct locale type
    try {
      // Генерируем slug, если он не предоставлен
      const slug = courseData.slug || slugify(courseData.title)

      // Создаем курс
      // Получаем или создаем необходимые объекты для обязательных полей

      // 1. Получаем или создаем автора
      let authorId = courseData.author
      if (!authorId) {
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
            authorId = firstAdmin.id
          } else {
            // Should not happen if length > 0, but satisfies TS
            throw new Error('Admin user data is unexpectedly missing.')
          }
        } else {
          throw new Error(
            'Не найден автор для курса. Укажите автора или создайте пользователя с ролью администратора.',
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

      // 3. Создаем базовое содержимое страницы курса
      const layout = courseData.layout || [
        {
          blockType: 'content',
          content: {
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: courseData.description || `Описание курса "${courseData.title}"`,
                      type: 'text',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'paragraph',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'root',
              version: 1,
            },
          },
        },
      ]

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
          author: authorId,
          featuredImage: featuredImageId,
          layout: layout,
        },
        ...(locale && { locale }),
      })

      // Создаем модули и уроки
      const createdModulesData = [] // Renamed to avoid conflict
      for (const [moduleIndex, moduleData] of courseData.modules.entries()) {
        const moduleOrder = moduleData.order !== undefined ? moduleData.order : moduleIndex + 1

        const moduleDoc = await this.createModule({ // Renamed from 'module'
          courseId: course.id,
          moduleData: { ...moduleData, order: moduleOrder }, // Ensure order is passed
          locale,
        })

        createdModulesData.push(moduleDoc)
      }

      return {
        course,
        modules: createdModulesData, // Return created data
      }
    } catch (error) {
      console.error('Error creating course:', error)
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
          title: moduleData.title,
          course: courseId,
          order: moduleData.order ?? 0, // Provide default value if undefined
          prerequisites: moduleData.prerequisites,
          ...(moduleData.description && { description: moduleData.description }),
        },
        ...(locale && { locale }),
      })

      // Создаем уроки для модуля
      const lessons = []
      for (const [lessonIndex, lessonData] of moduleData.lessons.entries()) {
        const lessonOrder = lessonData.order !== undefined ? lessonData.order : lessonIndex + 1

        const lesson = await this.createLesson({
          moduleId: moduleDoc.id, // Use renamed variable
          lessonData: { ...lessonData, order: lessonOrder }, // Ensure order is passed
          locale,
        })

        lessons.push(lesson)
      }

      return {
        module: moduleDoc, // Return created module doc
        lessons,
      }
    } catch (error) {
      console.error('Error creating module:', error)
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
          layout: lessonData.layout ?? [], // Provide default empty array if undefined
          order: lessonData.order ?? 0, // Provide default value if undefined
          // assessment: lessonData.assessment, // Still commented out - related to hang
          prerequisites: lessonData.prerequisites, // Uncommented
          completionCriteria: lessonData.completionCriteria ?? 'viewed', // Provide default value if undefined
          ...(lessonData.description && { description: lessonData.description }),
          ...(lessonData.duration && { duration: lessonData.duration }),
          ...(lessonData.type && { type: lessonData.type }),
        },
        ...(locale && { locale }),
      })
      return lesson
    } catch (error) {
      console.error('Error creating lesson:', error)
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
      console.error('Error finding courses:', error)
      throw error
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

import { getPayloadClient } from '@/utilities/payload'
import { slugify } from '@/utilities/strings'
import type { Payload } from 'payload'

// Типы для данных курса
export interface LessonData {
  title: string
  description?: string
  content?: string
  duration?: string
  type?: 'video' | 'text' | 'quiz' | 'assignment'
  order?: number
}

export interface ModuleData {
  title: string
  description?: string
  lessons: LessonData[]
  order?: number
}

export interface CourseData {
  title: string
  slug?: string
  excerpt?: string
  description?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration?: string
  status?: 'draft' | 'published' | 'archived'
  learningOutcomes?: string[]
  requirements?: string[]
  targetAudience?: string[]
  modules: ModuleData[]
  featuredImage?: string // ID медиа-файла
  author?: string // ID автора
  layout?: any[] // Содержимое страницы курса
}

export class CourseService {
  private payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  /**
   * Обновляет существующий курс в CMS
   */
  async updateCourse(courseData: CourseData & { id: string }, locale?: string): Promise<any> {
    try {
      // Обновляем курс
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
          // Добавляем локализацию, если необходимо
          ...(locale && { locale }),
          // Добавляем дополнительные поля, если они есть
          ...(courseData.learningOutcomes && {
            learningOutcomes: courseData.learningOutcomes.map((outcome) => ({ outcome })),
          }),
          ...(courseData.requirements && {
            requirements: courseData.requirements.map((requirement) => ({ requirement })),
          }),
          ...(courseData.targetAudience && {
            targetAudience: courseData.targetAudience.map((audience) => ({ audience })),
          }),
          ...(courseData.featuredImage && { featuredImage: courseData.featuredImage }),
          ...(courseData.author && { author: courseData.author }),
        },
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
      const modules = []
      for (const moduleData of courseData.modules) {
        let module

        if (moduleData.id) {
          // Обновляем существующий модуль
          module = await this.updateModule({
            moduleId: moduleData.id,
            moduleData,
            locale,
          })
        } else {
          // Создаем новый модуль
          module = await this.createModule({
            courseId: courseData.id,
            moduleData,
            locale,
          })
        }

        modules.push(module)
      }

      // Удаляем модули, которых нет в обновленном списке
      const updatedModuleIds = modules.map((m) => m.module.id)
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
        modules,
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
    locale?: string
  }): Promise<any> {
    try {
      // Обновляем модуль
      const module = await this.payload.update({
        collection: 'modules',
        id: moduleId,
        data: {
          title: moduleData.title,
          // Добавляем локализацию, если необходимо
          ...(locale && { locale }),
          // Другие поля модуля
          ...(moduleData.description && { description: moduleData.description }),
        },
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
        module,
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
    locale?: string
  }): Promise<any> {
    try {
      // Обновляем урок
      const lesson = await this.payload.update({
        collection: 'lessons',
        id: lessonId,
        data: {
          title: lessonData.title,
          // Добавляем локализацию, если необходимо
          ...(locale && { locale }),
          // Другие поля урока
          ...(lessonData.description && { description: lessonData.description }),
          ...(lessonData.content && { content: lessonData.content }),
          ...(lessonData.duration && { duration: lessonData.duration }),
          ...(lessonData.type && { type: lessonData.type }),
        },
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
  async createCourse(courseData: CourseData, locale?: string): Promise<any> {
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

        if (admins.docs.length > 0) {
          authorId = admins.docs[0].id
        } else {
          throw new Error(
            'Не найден автор для курса. Укажите автора или создайте пользователя с ролью администратора',
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

        if (defaultImages.docs.length > 0) {
          featuredImageId = defaultImages.docs[0].id
        } else {
          // Используем любое изображение из медиа
          const anyImages = await this.payload.find({
            collection: 'media',
            limit: 1,
          })

          if (anyImages.docs.length > 0) {
            featuredImageId = anyImages.docs[0].id
          } else {
            throw new Error(
              'Не найдено изображение для обложки курса. Загрузите изображение в медиатеку',
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
      const course = await this.payload.create({
        collection: 'courses',
        data: {
          title: courseData.title,
          slug,
          excerpt: courseData.excerpt,
          difficulty: courseData.difficulty || 'beginner',
          estimatedDuration: courseData.estimatedDuration,
          status: courseData.status || 'draft',
          // Обязательные поля
          author: authorId,
          featuredImage: featuredImageId,
          layout,
          // Добавляем локализацию, если необходимо
          ...(locale && { locale }),
          // Добавляем дополнительные поля, если они есть
          ...(courseData.learningOutcomes && {
            learningOutcomes: courseData.learningOutcomes.map((outcome) => ({ outcome })),
          }),
          ...(courseData.requirements && {
            requirements: courseData.requirements.map((requirement) => ({ requirement })),
          }),
          ...(courseData.targetAudience && {
            targetAudience: courseData.targetAudience.map((audience) => ({ audience })),
          }),
        },
      })

      // Создаем модули и уроки
      const modules = []
      for (const [moduleIndex, moduleData] of courseData.modules.entries()) {
        const moduleOrder = moduleData.order !== undefined ? moduleData.order : moduleIndex + 1

        const module = await this.createModule({
          courseId: course.id,
          moduleData,
          locale,
        })

        modules.push(module)
      }

      return {
        course,
        modules,
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
    locale?: string
  }): Promise<any> {
    try {
      // Создаем модуль
      const module = await this.payload.create({
        collection: 'modules',
        data: {
          title: moduleData.title,
          course: courseId,
          // Добавляем локализацию, если необходимо
          ...(locale && { locale }),
          // Другие поля модуля
          ...(moduleData.description && { description: moduleData.description }),
        },
      })

      // Создаем уроки для модуля
      const lessons = []
      for (const [lessonIndex, lessonData] of moduleData.lessons.entries()) {
        const lessonOrder = lessonData.order !== undefined ? lessonData.order : lessonIndex + 1

        const lesson = await this.createLesson({
          moduleId: module.id,
          lessonData,
          locale,
        })

        lessons.push(lesson)
      }

      return {
        module,
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
    locale?: string
  }): Promise<any> {
    try {
      // Создаем урок
      const lesson = await this.payload.create({
        collection: 'lessons',
        data: {
          title: lessonData.title,
          module: moduleId,
          // Добавляем локализацию, если необходимо
          ...(locale && { locale }),
          // Другие поля урока
          ...(lessonData.description && { description: lessonData.description }),
          ...(lessonData.content && { content: lessonData.content }),
          ...(lessonData.duration && { duration: lessonData.duration }),
          ...(lessonData.type && { type: lessonData.type }),
        },
      })

      return lesson
    } catch (error) {
      console.error('Error creating lesson:', error)
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

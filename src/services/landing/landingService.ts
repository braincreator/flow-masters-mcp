import { getPayloadClient } from '@/utilities/payload'
import { slugify } from '@/utilities/strings'
import type { Payload } from 'payload'

// Функция для преобразования массива в строку
function arrayToString(value: any): string {
  if (Array.isArray(value)) {
    return value.join(' ')
  }
  return String(value || '')
}

// Типы для данных лендинга
export interface HeroData {
  heading?: string | string[]
  subheading?: string | string[]
  ctaText?: string | string[]
  backgroundImage?: string // ID медиа-файла
}

export interface SectionData {
  type?: string
  blockType?: string
  content: any
}

export interface LandingData {
  title?: string
  slug?: string
  hero?: HeroData
  sections?: SectionData[]
  courseId: string // ID курса, для которого создается лендинг
}

export class LandingService {
  private payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  /**
   * Обновляет существующий лендинг в CMS
   */
  async updateLanding(
    landingData: LandingData & { id?: string },
    courseTitle: string,
    locale?: string,
  ): Promise<any> {
    try {
      // Если нет ID лендинга, пытаемся найти лендинг по курсу
      let landingId = landingData.id
      if (!landingId) {
        // Получаем информацию о курсе
        const course = await this.payload.findByID({
          collection: 'courses',
          id: landingData.courseId,
        })

        // Ищем лендинг по слагу курса
        const slug = `courses/${course.slug || course.id}`
        const pages = await this.payload.find({
          collection: 'pages',
          where: {
            slug: {
              equals: slug,
            },
          },
        })

        if (pages.docs.length > 0) {
          landingId = pages.docs[0].id
        } else {
          // Если лендинг не найден, создаем новый
          return this.createLanding(landingData, courseTitle, locale)
        }
      }

      // Получаем текущий лендинг
      const currentLanding = await this.payload.findByID({
        collection: 'pages',
        id: landingId,
      })

      // Преобразуем данные лендинга в формат, подходящий для CMS
      const pageData = {
        title: landingData.title || `${courseTitle} - Landing Page`,
        // Добавляем локализацию, если необходимо
        ...(locale && { locale }),
        // Настраиваем блоки лендинга
        layout: [
          // Hero блок
          ...(landingData.hero
            ? [
                {
                  blockType: 'hero',
                  blockName: 'Course Hero',
                  heading: arrayToString(landingData.hero.heading) || courseTitle,
                  subheading: arrayToString(landingData.hero.subheading) || currentLanding.excerpt,
                  ...(landingData.hero.ctaText && {
                    ctaText: arrayToString(landingData.hero.ctaText),
                  }),
                  ...(landingData.hero.backgroundImage && {
                    backgroundImage: landingData.hero.backgroundImage,
                  }),
                },
              ]
            : []),

          // Добавляем другие секции, если они есть
          ...(landingData.sections
            ? landingData.sections.map((section) => {
                // Определяем тип блока (используем blockType, если он есть, иначе type)
                const blockType = section.blockType || section.type || 'section'

                // Преобразуем секции в соответствующие блоки Payload
                return {
                  blockType,
                  blockName: `${blockType.charAt(0).toUpperCase() + blockType.slice(1)} Section`,
                  ...section.content,
                }
              })
            : []),

          // Добавляем блок с программой курса, если нет специальной секции
          {
            blockType: 'curriculum',
            blockName: 'Course Curriculum',
            heading: 'Программа курса',
            courseId: landingData.courseId,
          },

          // Добавляем CTA блок, если нет специальной секции
          {
            blockType: 'callToAction',
            blockName: 'Course CTA',
            heading: 'Готовы начать обучение?',
            text: 'Запишитесь на курс прямо сейчас и начните свой путь к новым знаниям.',
            buttons: [
              {
                label: landingData.hero?.ctaText
                  ? arrayToString(landingData.hero.ctaText)
                  : 'Записаться на курс',
                link: {
                  type: 'custom',
                  url: '#signup',
                },
              },
            ],
          },

          // Добавляем форму подписки
          {
            blockType: 'leadMagnetOffer',
            blockName: 'Course Signup Form',
            heading: 'Записаться на курс',
            subheading: 'Оставьте свои контактные данные, и мы свяжемся с вами',
            submitButtonLabel: 'Отправить заявку',
            formFields: [
              {
                name: 'name',
                label: 'Ваше имя',
                required: true,
                fieldType: 'text',
              },
              {
                name: 'email',
                label: 'Email',
                required: true,
                fieldType: 'email',
              },
              {
                name: 'phone',
                label: 'Телефон',
                required: false,
                fieldType: 'tel',
              },
            ],
            successAction: 'message',
            successMessage: 'Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время.',
          },

          // Добавляем блок для отслеживания шага воронки
          {
            blockType: 'funnelStep',
            blockName: 'Landing Page Visit',
            stepName: 'Посещение лендинга',
            funnelId: `course_${landingData.courseId}_funnel`,
            stepId: 'visit_landing',
          },
        ],
      }

      // Обновляем страницу лендинга в CMS
      const landing = await this.payload.update({
        collection: 'pages',
        id: landingId,
        data: pageData,
      })

      return landing
    } catch (error) {
      console.error('Error updating landing:', error)
      throw error
    }
  }

  /**
   * Создает новый лендинг в CMS
   */
  async createLanding(
    landingData: LandingData,
    courseTitle: string,
    locale?: string,
  ): Promise<any> {
    try {
      // Получаем информацию о курсе
      const course = await this.payload.findByID({
        collection: 'courses',
        id: landingData.courseId,
      })

      // Генерируем заголовок и slug, если они не предоставлены
      const title = landingData.title || `${courseTitle} - Landing Page`
      const slug = landingData.slug || `courses/${slugify(courseTitle)}`

      // Преобразуем данные лендинга в формат, подходящий для CMS
      const pageData = {
        title,
        slug,
        status: 'draft',
        // Добавляем локализацию, если необходимо
        ...(locale && { locale }),
        // Настраиваем блоки лендинга
        layout: [
          // Hero блок
          ...(landingData.hero
            ? [
                {
                  blockType: 'hero',
                  blockName: 'Course Hero',
                  heading: arrayToString(landingData.hero.heading) || courseTitle,
                  subheading: arrayToString(landingData.hero.subheading) || course.excerpt,
                  ...(landingData.hero.ctaText && {
                    ctaText: arrayToString(landingData.hero.ctaText),
                  }),
                  ...(landingData.hero.backgroundImage && {
                    backgroundImage: landingData.hero.backgroundImage,
                  }),
                },
              ]
            : []),

          // Добавляем другие секции, если они есть
          ...(landingData.sections
            ? landingData.sections.map((section) => {
                // Определяем тип блока (используем blockType, если он есть, иначе type)
                const blockType = section.blockType || section.type || 'section'

                // Преобразуем секции в соответствующие блоки Payload
                return {
                  blockType,
                  blockName: `${blockType.charAt(0).toUpperCase() + blockType.slice(1)} Section`,
                  ...section.content,
                }
              })
            : []),

          // Добавляем блок с программой курса, если нет специальной секции
          {
            blockType: 'curriculum',
            blockName: 'Course Curriculum',
            heading: 'Программа курса',
            courseId: landingData.courseId,
          },

          // Добавляем CTA блок, если нет специальной секции
          {
            blockType: 'callToAction',
            blockName: 'Course CTA',
            heading: 'Готовы начать обучение?',
            text: 'Запишитесь на курс прямо сейчас и начните свой путь к новым знаниям.',
            buttons: [
              {
                label: landingData.hero?.ctaText
                  ? arrayToString(landingData.hero.ctaText)
                  : 'Записаться на курс',
                link: {
                  type: 'custom',
                  url: '#signup',
                },
              },
            ],
          },

          // Добавляем форму подписки
          {
            blockType: 'leadMagnetOffer',
            blockName: 'Course Signup Form',
            heading: 'Записаться на курс',
            subheading: 'Оставьте свои контактные данные, и мы свяжемся с вами',
            submitButtonLabel: 'Отправить заявку',
            formFields: [
              {
                name: 'name',
                label: 'Ваше имя',
                required: true,
                fieldType: 'text',
              },
              {
                name: 'email',
                label: 'Email',
                required: true,
                fieldType: 'email',
              },
              {
                name: 'phone',
                label: 'Телефон',
                required: false,
                fieldType: 'tel',
              },
            ],
            successAction: 'message',
            successMessage: 'Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время.',
          },

          // Добавляем блок для отслеживания шага воронки
          {
            blockType: 'funnelStep',
            blockName: 'Landing Page Visit',
            stepName: 'Посещение лендинга',
            funnelId: `course_${landingData.courseId}_funnel`,
            stepId: 'visit_landing',
          },
        ],
      }

      // Создаем страницу лендинга в CMS
      const landing = await this.payload.create({
        collection: 'pages',
        data: pageData,
      })

      return landing
    } catch (error) {
      console.error('Error creating landing:', error)
      throw error
    }
  }
}

/**
 * Создает экземпляр сервиса лендингов
 */
export async function getLandingService(): Promise<LandingService> {
  const payload = await getPayloadClient()
  return new LandingService(payload)
}

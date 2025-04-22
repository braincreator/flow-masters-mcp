import { getPayloadClient } from '@/utilities/payload'
import { slugify } from '@/utilities/strings'
import type { Payload } from 'payload'

/**
 * Типы для генерации лендинга
 */
export interface LandingGeneratorOptions {
  title: string
  slug?: string
  description?: string
  keywords?: string[]
  target?: 'leads' | 'sales' | 'info'
  style?: 'minimal' | 'standard' | 'premium'
  primaryColor?: string
  secondaryColor?: string
  includeHero?: boolean
  includeFeatures?: boolean
  includeFaq?: boolean
  includeTestimonials?: boolean
  includeCta?: boolean
  includeLeadForm?: boolean
  leadFormPosition?: 'top' | 'middle' | 'bottom' | 'multiple'
  leadFormFields?: string[]
  status?: 'draft' | 'published'
  locale?: string
}

/**
 * Сервис для генерации лендингов
 */
export class LandingGeneratorService {
  private payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  /**
   * Генерирует лендинг на основе указанных опций
   */
  async generateLanding(options: LandingGeneratorOptions): Promise<any> {
    try {
      // Генерируем slug, если он не указан
      const slug = options.slug || slugify(options.title)

      // Проверяем, существует ли страница с таким slug
      const existingPages = await this.payload.find({
        collection: 'pages',
        where: {
          slug: {
            equals: slug,
          },
        },
      })

      if (existingPages.docs.length > 0) {
        throw new Error(`Страница с slug "${slug}" уже существует`)
      }

      // Формируем блоки лендинга
      const blocks = []

      // Добавляем Hero блок, если он включен
      if (options.includeHero !== false) {
        blocks.push({
          blockType: 'hero',
          blockName: 'Landing Hero',
          heading: options.title,
          subheading: options.description || 'Подробное описание предложения',
          ctaText: 'Узнать больше',
          backgroundType: 'gradient',
          backgroundGradient: options.primaryColor
            ? `linear-gradient(135deg, ${options.primaryColor}, ${
                options.secondaryColor || '#ffffff'
              })`
            : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
        })
      }

      // Добавляем блок с преимуществами, если он включен
      if (options.includeFeatures) {
        blocks.push({
          blockType: 'features',
          blockName: 'Key Features',
          heading: 'Наши преимущества',
          subheading: 'Почему стоит выбрать именно нас',
          features: [
            {
              title: 'Преимущество 1',
              description: 'Описание первого преимущества',
              icon: 'star',
            },
            {
              title: 'Преимущество 2',
              description: 'Описание второго преимущества',
              icon: 'shield',
            },
            {
              title: 'Преимущество 3',
              description: 'Описание третьего преимущества',
              icon: 'check',
            },
          ],
        })
      }

      // Добавляем форму для сбора лидов в верхней части, если указано
      if (options.includeLeadForm && ['top', 'multiple'].includes(options.leadFormPosition || '')) {
        blocks.push(this.createLeadForm(options, 'top'))
      }

      // Добавляем блок с отзывами, если он включен
      if (options.includeTestimonials) {
        blocks.push({
          blockType: 'testimonial',
          blockName: 'Testimonials',
          heading: 'Что говорят наши клиенты',
          testimonials: [
            {
              quote: 'Отличный сервис, очень доволен результатом!',
              author: 'Иван Петров',
              role: 'CEO, Company Name',
            },
            {
              quote: 'Рекомендую всем, кто ценит качество и профессионализм.',
              author: 'Мария Иванова',
              role: 'Marketing Director',
            },
          ],
        })
      }

      // Добавляем форму для сбора лидов в середине, если указано
      if (options.includeLeadForm && ['middle', 'multiple'].includes(options.leadFormPosition || '')) {
        blocks.push(this.createLeadForm(options, 'middle'))
      }

      // Добавляем блок с FAQ, если он включен
      if (options.includeFaq) {
        blocks.push({
          blockType: 'faq',
          blockName: 'FAQ Section',
          heading: 'Часто задаваемые вопросы',
          items: [
            {
              question: 'Вопрос 1?',
              answer: 'Ответ на первый вопрос.',
            },
            {
              question: 'Вопрос 2?',
              answer: 'Ответ на второй вопрос.',
            },
            {
              question: 'Вопрос 3?',
              answer: 'Ответ на третий вопрос.',
            },
          ],
        })
      }

      // Добавляем CTA блок, если он включен
      if (options.includeCta) {
        blocks.push({
          blockType: 'callToAction',
          blockName: 'Call To Action',
          heading: 'Готовы начать?',
          content: 'Присоединяйтесь к нам сегодня и получите доступ ко всем возможностям.',
          actions: [
            {
              label: 'Начать сейчас',
              href: '#lead-form-bottom',
              variant: 'primary',
            },
          ],
          background: 'gradient',
        })
      }

      // Добавляем форму для сбора лидов в нижней части, если указано
      if (options.includeLeadForm && ['bottom', 'multiple'].includes(options.leadFormPosition || '')) {
        blocks.push(this.createLeadForm(options, 'bottom'))
      }

      // Создаем страницу лендинга в CMS
      const landing = await this.payload.create({
        collection: 'pages',
        data: {
          title: options.title,
          slug,
          status: options.status || 'draft',
          ...(options.locale && { locale: options.locale }),
          layout: blocks,
          meta: {
            title: options.title,
            description: options.description || `${options.title} - Узнайте больше о нашем предложении`,
            keywords: options.keywords?.join(', ') || '',
          },
        },
      })

      return landing
    } catch (error) {
      console.error('Error generating landing:', error)
      throw error
    }
  }

  /**
   * Создает блок формы для сбора лидов
   */
  private createLeadForm(
    options: LandingGeneratorOptions,
    position: 'top' | 'middle' | 'bottom',
  ): any {
    // Определяем заголовок в зависимости от позиции
    let heading = 'Оставьте свои контактные данные'
    let subheading = 'Мы свяжемся с вами в ближайшее время'

    if (position === 'top') {
      heading = 'Получите бесплатную консультацию'
      subheading = 'Заполните форму, и мы свяжемся с вами'
    } else if (position === 'middle') {
      heading = 'Узнайте больше о нашем предложении'
      subheading = 'Оставьте свои контакты для получения подробной информации'
    } else if (position === 'bottom') {
      heading = 'Готовы начать? Оставьте заявку'
      subheading = 'Заполните форму, и мы свяжемся с вами в ближайшее время'
    }

    // Определяем поля формы
    const formFields = []

    // Добавляем стандартные поля, если не указаны конкретные
    if (!options.leadFormFields || options.leadFormFields.length === 0) {
      formFields.push(
        {
          fieldName: 'name',
          label: 'Ваше имя',
          fieldType: 'text',
          required: true,
        },
        {
          fieldName: 'email',
          label: 'Email',
          fieldType: 'email',
          required: true,
        },
        {
          fieldName: 'phone',
          label: 'Телефон',
          fieldType: 'tel',
          required: false,
        },
      )
    } else {
      // Добавляем указанные поля
      options.leadFormFields.forEach((field) => {
        if (field === 'name') {
          formFields.push({
            fieldName: 'name',
            label: 'Ваше имя',
            fieldType: 'text',
            required: true,
          })
        } else if (field === 'email') {
          formFields.push({
            fieldName: 'email',
            label: 'Email',
            fieldType: 'email',
            required: true,
          })
        } else if (field === 'phone') {
          formFields.push({
            fieldName: 'phone',
            label: 'Телефон',
            fieldType: 'tel',
            required: false,
          })
        } else if (field === 'company') {
          formFields.push({
            fieldName: 'company',
            label: 'Компания',
            fieldType: 'text',
            required: false,
          })
        } else if (field === 'message') {
          formFields.push({
            fieldName: 'message',
            label: 'Сообщение',
            fieldType: 'text',
            required: false,
          })
        } else if (field === 'consent') {
          formFields.push({
            fieldName: 'consent',
            label: 'Я согласен на обработку персональных данных',
            fieldType: 'checkbox',
            required: true,
            consentText: {
              root: {
                children: [
                  {
                    children: [
                      {
                        text: 'Нажимая на кнопку, вы даете согласие на обработку персональных данных и соглашаетесь с политикой конфиденциальности.',
                      },
                    ],
                    type: 'paragraph',
                  },
                ],
                type: 'root',
              },
            },
          })
        }
      })
    }

    // Создаем блок формы
    return {
      blockType: 'leadMagnetOffer',
      blockName: `Lead Form ${position.charAt(0).toUpperCase() + position.slice(1)}`,
      heading,
      subheading,
      submitButtonLabel: 'Отправить',
      formFields,
      submissionTarget: 'collection',
      submissionSettings: {
        targetCollection: 'leads',
      },
      successAction: 'message',
      successMessage: {
        root: {
          children: [
            {
              children: [
                {
                  text: 'Спасибо! Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'root',
        },
      },
      layout: position === 'top' ? 'imageRight' : position === 'middle' ? 'imageLeft' : 'formOnly',
      ...(options.primaryColor && { backgroundColor: options.primaryColor + '10' }), // Добавляем прозрачность
    }
  }
}

/**
 * Создает экземпляр сервиса генерации лендингов
 */
export async function getLandingGeneratorService(): Promise<LandingGeneratorService> {
  const payload = await getPayloadClient()
  return new LandingGeneratorService(payload)
}

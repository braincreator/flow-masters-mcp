import { getPayloadClient } from '@/utilities/payload'
import type { Payload } from 'payload'

// Типы для данных воронки
export interface EmailData {
  subject: string
  content: string
  delay?: number // Задержка в днях
  triggerEvent?: string // Событие, которое запускает отправку
}

export interface FunnelStepData {
  name: string
  id: string
  triggerType?: string
  content?: any
}

export interface FunnelData {
  name: string
  courseId: string // ID курса, для которого создается воронка
  steps?: FunnelStepData[]
  emailSequence?: EmailData[]
}

export class FunnelService {
  private payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  /**
   * Обновляет существующую автоворонку в CMS
   */
  async updateFunnel(
    funnelData: FunnelData & { id?: string },
    courseTitle: string,
    locale?: string,
  ): Promise<any> {
    try {
      // Если нет ID воронки, пытаемся найти воронку по курсу
      let funnelId = funnelData.id
      if (!funnelId) {
        // Пытаемся найти воронку по курсу
        try {
          const funnels = await this.payload.find({
            collection: 'funnels', // Предполагается, что такая коллекция существует
            where: {
              course: {
                equals: funnelData.courseId,
              },
            },
          })

          if (funnels.docs.length > 0) {
            funnelId = funnels.docs[0].id
          } else {
            // Если воронка не найдена, создаем новую
            return this.createFunnel(funnelData, courseTitle, locale)
          }
        } catch (error) {
          // Если коллекция не существует, создаем новую воронку
          console.warn('Funnels collection might not exist:', error.message)
          return this.createFunnel(funnelData, courseTitle, locale)
        }
      }

      // Обновляем email-последовательность
      const emailSequence = []
      if (funnelData.emailSequence) {
        for (const email of funnelData.emailSequence) {
          let emailTemplate

          if (email.id) {
            // Обновляем существующий шаблон
            emailTemplate = await this.updateEmailTemplate({
              id: email.id,
              name: `${courseTitle} - ${email.subject}`,
              subject: email.subject,
              content: email.content,
              locale,
            })
          } else {
            // Создаем новый шаблон
            emailTemplate = await this.createEmailTemplate({
              name: `${courseTitle} - ${email.subject}`,
              subject: email.subject,
              content: email.content,
              locale,
            })
          }

          emailSequence.push({
            template: emailTemplate.id,
            delay: email.delay || 0,
            triggerEvent: email.triggerEvent || 'signup',
          })
        }
      }

      // Обновляем шаги воронки
      const funnelSteps = []
      if (funnelData.steps) {
        for (const step of funnelData.steps) {
          // Здесь можно обновить страницы или другие объекты для шагов воронки

          funnelSteps.push({
            name: step.name,
            id: step.id,
            triggerType: step.triggerType,
            // Другие данные шага
          })
        }
      }

      // Обновляем конфигурацию воронки
      try {
        const funnel = await this.payload.update({
          collection: 'funnels', // Предполагается, что такая коллекция существует
          id: funnelId,
          data: {
            name: funnelData.name,
            course: funnelData.courseId,
            // Добавляем локализацию, если необходимо
            ...(locale && { locale }),
            // Сохраняем конфигурацию воронки
            emailSequence,
            steps: funnelSteps,
          },
        })

        return funnel
      } catch (error) {
        // Если коллекция не существует, возвращаем данные
        console.warn('Funnels collection might not exist:', error.message)
        return {
          id: funnelId,
          name: funnelData.name,
          course: funnelData.courseId,
          emailSequence,
          steps: funnelSteps,
        }
      }
    } catch (error) {
      console.error('Error updating funnel:', error)
      throw error
    }
  }

  /**
   * Обновляет шаблон email для воронки
   */
  async updateEmailTemplate({
    id,
    name,
    subject,
    content,
    locale,
  }: {
    id: string
    name: string
    subject: string
    content: string
    locale?: string
  }): Promise<any> {
    try {
      // Обновляем шаблон email
      try {
        const emailTemplate = await this.payload.update({
          collection: 'emailTemplates', // Предполагается, что такая коллекция существует
          id,
          data: {
            name,
            subject,
            content,
            // Добавляем локализацию, если необходимо
            ...(locale && { locale }),
          },
        })

        return emailTemplate
      } catch (error) {
        // Если коллекция не существует, возвращаем данные
        console.warn('EmailTemplates collection might not exist:', error.message)
        return {
          id,
          name,
          subject,
          content,
        }
      }
    } catch (error) {
      console.error('Error updating email template:', error)
      throw error
    }
  }

  /**
   * Создает новую автоворонку в CMS
   */
  async createFunnel(funnelData: FunnelData, courseTitle: string, locale?: string): Promise<any> {
    try {
      // Создаем email-последовательность
      const emailSequence = []
      if (funnelData.emailSequence) {
        for (const email of funnelData.emailSequence) {
          const emailTemplate = await this.createEmailTemplate({
            name: `${courseTitle} - ${email.subject}`,
            subject: email.subject,
            content: email.content,
            locale,
          })

          emailSequence.push({
            template: emailTemplate.id,
            delay: email.delay || 0,
            triggerEvent: email.triggerEvent || 'signup',
          })
        }
      }

      // Создаем шаги воронки
      const funnelSteps = []
      if (funnelData.steps) {
        for (const step of funnelData.steps) {
          // Здесь можно создать страницы или другие объекты для шагов воронки
          // В зависимости от структуры CMS

          funnelSteps.push({
            name: step.name,
            id: step.id,
            triggerType: step.triggerType,
            // Другие данные шага
          })
        }
      }

      // Создаем конфигурацию воронки
      // Предполагается, что в CMS есть коллекция для хранения конфигураций воронок
      const funnel = await this.payload
        .create({
          collection: 'funnels', // Предполагается, что такая коллекция существует
          data: {
            name: funnelData.name,
            course: funnelData.courseId,
            // Добавляем локализацию, если необходимо
            ...(locale && { locale }),
            // Сохраняем конфигурацию воронки
            emailSequence,
            steps: funnelSteps,
          },
        })
        .catch((error) => {
          // Если коллекция не существует, просто возвращаем данные
          console.warn('Funnels collection might not exist:', error.message)
          return {
            name: funnelData.name,
            course: funnelData.courseId,
            emailSequence,
            steps: funnelSteps,
          }
        })

      return funnel
    } catch (error) {
      console.error('Error creating funnel:', error)
      throw error
    }
  }

  /**
   * Создает шаблон email для воронки
   */
  async createEmailTemplate({
    name,
    subject,
    content,
    locale,
  }: {
    name: string
    subject: string
    content: string
    locale?: string
  }): Promise<any> {
    try {
      // Создаем шаблон email
      // Предполагается, что в CMS есть коллекция для хранения шаблонов email
      const emailTemplate = await this.payload
        .create({
          collection: 'emailTemplates', // Предполагается, что такая коллекция существует
          data: {
            name,
            subject,
            content,
            // Добавляем локализацию, если необходимо
            ...(locale && { locale }),
          },
        })
        .catch((error) => {
          // Если коллекция не существует, просто возвращаем данные
          console.warn('EmailTemplates collection might not exist:', error.message)
          return {
            id: `template_${Date.now()}`,
            name,
            subject,
            content,
          }
        })

      return emailTemplate
    } catch (error) {
      console.error('Error creating email template:', error)
      throw error
    }
  }
}

/**
 * Создает экземпляр сервиса воронок
 */
export async function getFunnelService(): Promise<FunnelService> {
  const payload = await getPayloadClient()
  return new FunnelService(payload)
}

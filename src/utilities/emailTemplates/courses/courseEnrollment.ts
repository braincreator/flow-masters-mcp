import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'

export interface CourseEnrollmentEmailData extends BaseEmailTemplateData {
  userName: string
  email?: string
  courseName: string
  courseId: string
  courseUrl?: string
  expiresAt?: string
  isPaid?: boolean
  orderNumber?: string
}

/**
 * Email template for course enrollment confirmation
 */
export class CourseEnrollmentEmail extends BaseEmailTemplate<CourseEnrollmentEmailData> {
  private userName: string
  private courseName: string
  private courseId: string
  private courseUrl: string
  private expiresAt?: string
  private isPaid: boolean
  private orderNumber?: string

  constructor(data: CourseEnrollmentEmailData) {
    super(data)
    this.userName = data.userName
    this.courseName = data.courseName
    this.courseId = data.courseId
    this.courseUrl = data.courseUrl || `${this.siteUrl}/${this.locale}/courses/${this.courseId}`
    this.expiresAt = data.expiresAt
    this.isPaid = data.isPaid || false
    this.orderNumber = data.orderNumber
  }

  protected generateContent() {
    // Localized texts
    const texts =
      this.locale === 'ru'
        ? {
            subject: `Вы успешно записаны на курс "${this.courseName}"`,
            greeting: `Здравствуйте, ${this.userName}!`,
            enrollmentConfirmation: `Вы успешно записаны на курс "${this.courseName}".`,
            startLearning: 'Начните обучение прямо сейчас!',
            buttonText: 'Перейти к курсу',
            expirationInfo: `Доступ к курсу действителен до: ${this.expiresAt}`,
            noExpiration: 'Доступ к курсу не ограничен по времени.',
            orderInfo: `Номер заказа: ${this.orderNumber}`,
            paidCourseInfo: 'Спасибо за покупку курса! Ваш платеж успешно обработан.',
            freeCourseInfo: 'Этот курс предоставляется бесплатно.',
            supportInfo: 'Если у вас возникнут вопросы, обратитесь в нашу службу поддержки.',
            footer: 'С уважением, команда Flow Masters',
          }
        : {
            subject: `You've successfully enrolled in "${this.courseName}"`,
            greeting: `Hello, ${this.userName}!`,
            enrollmentConfirmation: `You've successfully enrolled in the "${this.courseName}" course.`,
            startLearning: 'Start learning right now!',
            buttonText: 'Go to course',
            expirationInfo: `Your access to the course is valid until: ${this.expiresAt}`,
            noExpiration: 'Your access to the course has no time limit.',
            orderInfo: `Order number: ${this.orderNumber}`,
            paidCourseInfo:
              'Thank you for purchasing this course! Your payment has been successfully processed.',
            freeCourseInfo: 'This course is provided free of charge.',
            supportInfo: 'If you have any questions, please contact our support team.',
            footer: 'Best regards, Flow Masters Team',
          }

    // Build the body content
    const bodyContent = `
      <h1>${texts.subject}</h1>
      <p>${texts.greeting}</p>
      <p>${texts.enrollmentConfirmation}</p>

      ${this.isPaid ? `<p>${texts.paidCourseInfo}</p>` : `<p>${texts.freeCourseInfo}</p>`}
      ${this.orderNumber ? `<p>${texts.orderInfo}</p>` : ''}

      <p>${this.expiresAt ? texts.expirationInfo : texts.noExpiration}</p>

      <p>${texts.startLearning}</p>

      <a href="${this.courseUrl}" class="button">${texts.buttonText}</a>

      <p>${texts.supportInfo}</p>
    `

    const footerContent = `
      <p>${texts.footer}</p>
    `

    return {
      subject: texts.subject,
      bodyContent,
      footerContent,
    }
  }
}

/**
 * Generate HTML for course enrollment email
 */
export function generateCourseEnrollmentEmail(data: CourseEnrollmentEmailData): string {
  const email = new CourseEnrollmentEmail(data)
  return email.generateHTML()
}

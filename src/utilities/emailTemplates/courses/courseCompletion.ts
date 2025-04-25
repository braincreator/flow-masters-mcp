import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'

export interface CourseCompletionEmailData extends BaseEmailTemplateData {
  userName: string
  email?: string
  courseName: string
  courseId: string
  certificateId?: string
  certificateUrl?: string
  completionDate?: string
  nextCourseId?: string
  nextCourseName?: string
}

/**
 * Email template for course completion
 */
export class CourseCompletionEmail extends BaseEmailTemplate<CourseCompletionEmailData> {
  private userName: string
  private courseName: string
  private courseId: string
  private certificateId?: string
  private certificateUrl?: string
  private completionDate: string
  private nextCourseId?: string
  private nextCourseName?: string
  private nextCourseUrl?: string

  constructor(data: CourseCompletionEmailData) {
    super(data)
    this.userName = data.userName
    this.courseName = data.courseName
    this.courseId = data.courseId
    this.certificateId = data.certificateId
    this.certificateUrl =
      data.certificateUrl ||
      (data.certificateId
        ? `${this.siteUrl}/${this.locale}/certificates/${data.certificateId}`
        : undefined)
    this.completionDate = data.completionDate || new Date().toISOString()
    this.nextCourseId = data.nextCourseId
    this.nextCourseName = data.nextCourseName
    this.nextCourseUrl = data.nextCourseId
      ? `${this.siteUrl}/${this.locale}/courses/${data.nextCourseId}`
      : undefined
  }

  protected generateContent() {
    // Format the completion date
    const formattedDate = new Date(this.completionDate).toLocaleDateString(
      this.locale === 'ru' ? 'ru-RU' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' },
    )

    // Localized texts
    const texts =
      this.locale === 'ru'
        ? {
            subject: `Поздравляем с завершением курса "${this.courseName}"!`,
            greeting: `Здравствуйте, ${this.userName}!`,
            congratulations: `Поздравляем с успешным завершением курса "${this.courseName}"!`,
            completionDate: `Дата завершения: ${formattedDate}`,
            achievement:
              'Это значительное достижение, и вы можете гордиться своими усилиями и настойчивостью.',
            certificateInfo: 'Мы рады предоставить вам сертификат о прохождении курса.',
            downloadCertificate: 'Скачать сертификат',
            viewCertificate: 'Просмотреть сертификат',
            nextCoursePrompt: `Готовы продолжить обучение? Рекомендуем вам курс "${this.nextCourseName}".`,
            exploreNextCourse: 'Изучить следующий курс',
            exploreCourses: 'Изучить другие курсы',
            feedbackPrompt:
              'Мы будем признательны за ваш отзыв о курсе. Это поможет нам улучшить наши материалы.',
            leaveFeedback: 'Оставить отзыв',
            footer: 'С уважением, команда Flow Masters',
          }
        : {
            subject: `Congratulations on completing "${this.courseName}"!`,
            greeting: `Hello, ${this.userName}!`,
            congratulations: `Congratulations on successfully completing the "${this.courseName}" course!`,
            completionDate: `Completion date: ${formattedDate}`,
            achievement:
              'This is a significant achievement, and you should be proud of your effort and persistence.',
            certificateInfo: 'We are pleased to provide you with a certificate of completion.',
            downloadCertificate: 'Download Certificate',
            viewCertificate: 'View Certificate',
            nextCoursePrompt: `Ready to continue learning? We recommend the "${this.nextCourseName}" course.`,
            exploreNextCourse: 'Explore Next Course',
            exploreCourses: 'Explore Other Courses',
            feedbackPrompt:
              'We would appreciate your feedback on the course. This will help us improve our materials.',
            leaveFeedback: 'Leave Feedback',
            footer: 'Best regards, Flow Masters Team',
          }

    // Build the body content
    let bodyContent = `
      <h1>${texts.subject}</h1>
      <p>${texts.greeting}</p>
      <p>${texts.congratulations}</p>
      <p>${texts.completionDate}</p>
      <p>${texts.achievement}</p>
    `

    // Add certificate section if available
    if (this.certificateUrl) {
      bodyContent += `
        <div class="highlight-box">
          <p>${texts.certificateInfo}</p>
          <a href="${this.certificateUrl}" class="button">${texts.viewCertificate}</a>
        </div>
      `
    }

    // Add next course recommendation if available
    if (this.nextCourseUrl && this.nextCourseName) {
      bodyContent += `
        <div style="margin-top: 30px;">
          <p>${texts.nextCoursePrompt}</p>
          <a href="${this.nextCourseUrl}" class="button">${texts.exploreNextCourse}</a>
        </div>
      `
    } else {
      bodyContent += `
        <div style="margin-top: 30px;">
          <a href="${this.siteUrl}/${this.locale}/courses" class="button">${texts.exploreCourses}</a>
        </div>
      `
    }

    // Add feedback section
    bodyContent += `
      <div style="margin-top: 30px;">
        <p>${texts.feedbackPrompt}</p>
        <a href="${this.siteUrl}/${this.locale}/courses/${this.courseId}/feedback" class="secondary-button">${texts.leaveFeedback}</a>
      </div>
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
 * Generate HTML for course completion email
 */
export function generateCourseCompletionEmail(data: CourseCompletionEmailData): string {
  const email = new CourseCompletionEmail(data)
  return email.generateHTML()
}

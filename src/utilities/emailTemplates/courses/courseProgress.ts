import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'

export interface CourseProgressEmailData extends BaseEmailTemplateData {
  userName: string
  email?: string
  courseName: string
  courseId: string
  progressPercentage: number
  nextLessonName?: string
  nextLessonUrl?: string
  remainingLessons?: number
  estimatedTimeToComplete?: string
}

/**
 * Email template for course progress milestones
 */
export class CourseProgressEmail extends BaseEmailTemplate<CourseProgressEmailData> {
  private userName: string
  private courseName: string
  private courseId: string
  private progressPercentage: number
  private courseUrl: string
  private nextLessonName?: string
  private nextLessonUrl?: string
  private remainingLessons?: number
  private estimatedTimeToComplete?: string

  constructor(data: CourseProgressEmailData) {
    super(data)
    this.userName = data.userName
    this.courseName = data.courseName
    this.courseId = data.courseId
    this.progressPercentage = Math.min(100, Math.max(0, data.progressPercentage))
    this.courseUrl = `${this.siteUrl}/${this.locale}/courses/${this.courseId}`
    this.nextLessonName = data.nextLessonName
    this.nextLessonUrl = data.nextLessonUrl
    this.remainingLessons = data.remainingLessons
    this.estimatedTimeToComplete = data.estimatedTimeToComplete
  }

  protected generateContent() {
    // Determine milestone type
    const isMilestone25 = this.progressPercentage >= 25 && this.progressPercentage < 50
    const isMilestone50 = this.progressPercentage >= 50 && this.progressPercentage < 75
    const isMilestone75 = this.progressPercentage >= 75 && this.progressPercentage < 100

    // Localized texts
    const texts =
      this.locale === 'ru'
        ? {
            subject: `${this.progressPercentage}% пройдено в курсе "${this.courseName}"`,
            greeting: `Здравствуйте, ${this.userName}!`,
            milestone25: `Вы прошли 25% курса "${this.courseName}"! Отличное начало!`,
            milestone50: `Вы прошли уже половину курса "${this.courseName}"! Так держать!`,
            milestone75: `Вы прошли 75% курса "${this.courseName}"! Финишная прямая!`,
            progressInfo: `Ваш текущий прогресс: ${this.progressPercentage}%`,
            nextLesson: `Следующий урок: ${this.nextLessonName}`,
            remainingLessons: `Осталось уроков: ${this.remainingLessons}`,
            estimatedTime: `Примерное время до завершения: ${this.estimatedTimeToComplete}`,
            continuePrompt: 'Продолжайте обучение, чтобы получить максимум от курса!',
            buttonText: 'Продолжить обучение',
            nextLessonButton: 'Перейти к следующему уроку',
            motivation25: 'Вы только начали свой путь. Продолжайте в том же духе!',
            motivation50: 'Вы на полпути! Уже многое изучено, но впереди еще много интересного.',
            motivation75: 'Вы почти у цели! Осталось совсем немного до завершения курса.',
            footer: 'С уважением, команда Flow Masters',
          }
        : {
            subject: `${this.progressPercentage}% completed in "${this.courseName}"`,
            greeting: `Hello, ${this.userName}!`,
            milestone25: `You've completed 25% of the "${this.courseName}" course! Great start!`,
            milestone50: `You've completed half of the "${this.courseName}" course! Keep it up!`,
            milestone75: `You've completed 75% of the "${this.courseName}" course! The finish line is in sight!`,
            progressInfo: `Your current progress: ${this.progressPercentage}%`,
            nextLesson: `Next lesson: ${this.nextLessonName}`,
            remainingLessons: `Remaining lessons: ${this.remainingLessons}`,
            estimatedTime: `Estimated time to complete: ${this.estimatedTimeToComplete}`,
            continuePrompt: 'Continue learning to get the most out of the course!',
            buttonText: 'Continue Learning',
            nextLessonButton: 'Go to Next Lesson',
            motivation25: "You've just begun your journey. Keep up the good work!",
            motivation50:
              "You're halfway there! You've learned a lot, but there's still more to discover.",
            motivation75: "You're almost there! Just a little more to complete the course.",
            footer: 'Best regards, Flow Masters Team',
          }

    // Determine milestone message
    let milestoneMessage = ''
    let motivationMessage = ''

    if (isMilestone25) {
      milestoneMessage = texts.milestone25
      motivationMessage = texts.motivation25
    } else if (isMilestone50) {
      milestoneMessage = texts.milestone50
      motivationMessage = texts.motivation50
    } else if (isMilestone75) {
      milestoneMessage = texts.milestone75
      motivationMessage = texts.motivation75
    }

    // Build the body content
    let bodyContent = `
      <h1>${texts.subject}</h1>
      <p>${texts.greeting}</p>
      <p><strong>${milestoneMessage}</strong></p>
      <p>${texts.progressInfo}</p>
    `

    // Add progress visualization
    bodyContent += `
      <div style="background-color: #f0f0f0; border-radius: 10px; height: 20px; width: 100%; margin: 20px 0;">
        <div style="background-color: #4CAF50; border-radius: 10px; height: 20px; width: ${this.progressPercentage}%;"></div>
      </div>
    `

    // Add next lesson info if available
    if (this.nextLessonName) {
      bodyContent += `<p>${texts.nextLesson}</p>`
    }

    // Add remaining lessons if available
    if (this.remainingLessons !== undefined) {
      bodyContent += `<p>${texts.remainingLessons}</p>`
    }

    // Add estimated time if available
    if (this.estimatedTimeToComplete) {
      bodyContent += `<p>${texts.estimatedTime}</p>`
    }

    // Add motivation message
    bodyContent += `<p>${motivationMessage}</p>`
    bodyContent += `<p>${texts.continuePrompt}</p>`

    // Add button to continue learning
    if (this.nextLessonUrl) {
      bodyContent += `<a href="${this.nextLessonUrl}" class="button">${texts.nextLessonButton}</a>`
    } else {
      bodyContent += `<a href="${this.courseUrl}" class="button">${texts.buttonText}</a>`
    }

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
 * Generate HTML for course progress email
 */
export function generateCourseProgressEmail(data: CourseProgressEmailData): string {
  const email = new CourseProgressEmail(data)
  return email.generateHTML()
}

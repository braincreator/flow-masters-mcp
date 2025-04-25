import { RewardEmailData, RewardGenericEmail } from './rewardGeneric'

/**
 * Email template for free course reward notification
 */
export class RewardFreeCourseEmail extends RewardGenericEmail {
  private courseId?: string
  private courseUrl?: string
  private courseDuration?: string
  private courseLevel?: string

  constructor(data: RewardEmailData & { 
    courseId?: string,
    courseUrl?: string,
    courseDuration?: string,
    courseLevel?: string
  }) {
    super(data)
    this.courseId = data.courseId
    this.courseUrl = data.courseUrl || (data.courseId ? `${this.siteUrl}/${this.locale}/courses/${data.courseId}` : undefined)
    this.courseDuration = data.courseDuration
    this.courseLevel = data.courseLevel
  }

  protected generateContent() {
    // Get base content from parent class
    const baseContent = super.generateContent()
    
    // Localized texts
    const texts = this.locale === 'ru' ? {
      subject: `Вы получили бесплатный курс: ${this.rewardTitle}`,
      courseInfo: 'Информация о курсе:',
      courseDuration: this.courseDuration ? `Продолжительность: ${this.courseDuration}` : '',
      courseLevel: this.courseLevel ? `Уровень: ${this.courseLevel}` : '',
      activationInfo: this.rewardCode 
        ? 'Используйте этот код для активации курса в личном кабинете.' 
        : 'Курс уже добавлен в ваш личный кабинет.',
      startLearning: 'Начните обучение прямо сейчас!',
      goToCourseButton: 'Перейти к курсу',
    } : {
      subject: `You've received a free course: ${this.rewardTitle}`,
      courseInfo: 'Course Information:',
      courseDuration: this.courseDuration ? `Duration: ${this.courseDuration}` : '',
      courseLevel: this.courseLevel ? `Level: ${this.courseLevel}` : '',
      activationInfo: this.rewardCode 
        ? 'Use this code to activate the course in your account dashboard.' 
        : 'The course has already been added to your account.',
      startLearning: 'Start learning right now!',
      goToCourseButton: 'Go to Course',
    }

    // Modify the subject
    baseContent.subject = texts.subject

    // Add course-specific information to the body content
    let bodyContent = baseContent.bodyContent

    // Insert course-specific information after the highlight-box div
    const insertPosition = bodyContent.indexOf('</div>', bodyContent.indexOf('highlight-box')) + 6

    const courseInfo = `
      <div style="margin-top: 20px;">
        <h3>${texts.courseInfo}</h3>
        ${this.courseDuration ? `<p>${texts.courseDuration}</p>` : ''}
        ${this.courseLevel ? `<p>${texts.courseLevel}</p>` : ''}
        <p>${texts.activationInfo}</p>
        <p><strong>${texts.startLearning}</strong></p>
      </div>
    `

    // Add go to course button
    const goToCourseButton = this.courseUrl ? `
      <div style="text-align: center; margin: 20px 0;">
        <a href="${this.courseUrl}" class="button">${texts.goToCourseButton}</a>
      </div>
    ` : ''

    bodyContent = bodyContent.slice(0, insertPosition) + courseInfo + bodyContent.slice(insertPosition)
    
    // Add go to course button before the support info
    if (this.courseUrl) {
      const supportInfoPosition = bodyContent.lastIndexOf('<p>')
      bodyContent = bodyContent.slice(0, supportInfoPosition) + goToCourseButton + bodyContent.slice(supportInfoPosition)
    }

    return {
      subject: baseContent.subject,
      bodyContent,
      footerContent: baseContent.footerContent
    }
  }
}

/**
 * Generate HTML for free course reward email
 */
export function generateRewardFreeCourseEmail(data: RewardEmailData & { 
  courseId?: string,
  courseUrl?: string,
  courseDuration?: string,
  courseLevel?: string
}): string {
  const email = new RewardFreeCourseEmail(data)
  return email.generateHTML()
}

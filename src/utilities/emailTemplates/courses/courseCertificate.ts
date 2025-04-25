import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'

export interface CourseCertificateEmailData extends BaseEmailTemplateData {
  userName: string
  email?: string
  courseName: string
  courseId: string
  certificateId: string
  certificateUrl?: string
  completionDate: string
  instructorName?: string
  shareableUrl?: string
}

/**
 * Email template for course certificate issuance
 */
export class CourseCertificateEmail extends BaseEmailTemplate<CourseCertificateEmailData> {
  private userName: string
  private courseName: string
  private courseId: string
  private certificateId: string
  private certificateUrl: string
  private completionDate: string
  private instructorName?: string
  private shareableUrl?: string

  constructor(data: CourseCertificateEmailData) {
    super(data)
    this.userName = data.userName
    this.courseName = data.courseName
    this.courseId = data.courseId
    this.certificateId = data.certificateId
    this.certificateUrl =
      data.certificateUrl || `${this.siteUrl}/${this.locale}/certificates/${data.certificateId}`
    this.completionDate = data.completionDate
    this.instructorName = data.instructorName
    this.shareableUrl =
      data.shareableUrl ||
      `${this.siteUrl}/${this.locale}/certificates/verify/${data.certificateId}`
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
            subject: `Ваш сертификат за курс "${this.courseName}"`,
            greeting: `Здравствуйте, ${this.userName}!`,
            certificateInfo: `Поздравляем с успешным завершением курса "${this.courseName}"! Ваш сертификат готов.`,
            completionDate: `Дата завершения: ${formattedDate}`,
            certificateId: `ID сертификата: ${this.certificateId}`,
            instructorNote: this.instructorName ? `Курс проведен: ${this.instructorName}` : '',
            downloadPrompt: 'Вы можете скачать или поделиться своим сертификатом по ссылкам ниже:',
            viewCertificate: 'Просмотреть сертификат',
            downloadCertificate: 'Скачать сертификат',
            shareCertificate: 'Поделиться сертификатом',
            linkedinPrompt: 'Добавьте этот сертификат в свой профиль LinkedIn:',
            addToLinkedin: 'Добавить в LinkedIn',
            verificationInfo: 'Этот сертификат можно проверить по ссылке ниже:',
            verifyCertificate: 'Проверить сертификат',
            congratulations: 'Еще раз поздравляем с этим достижением!',
            footer: 'С уважением, команда Flow Masters',
          }
        : {
            subject: `Your certificate for "${this.courseName}"`,
            greeting: `Hello, ${this.userName}!`,
            certificateInfo: `Congratulations on successfully completing the "${this.courseName}" course! Your certificate is ready.`,
            completionDate: `Completion date: ${formattedDate}`,
            certificateId: `Certificate ID: ${this.certificateId}`,
            instructorNote: this.instructorName
              ? `Course conducted by: ${this.instructorName}`
              : '',
            downloadPrompt: 'You can download or share your certificate using the links below:',
            viewCertificate: 'View Certificate',
            downloadCertificate: 'Download Certificate',
            shareCertificate: 'Share Certificate',
            linkedinPrompt: 'Add this certificate to your LinkedIn profile:',
            addToLinkedin: 'Add to LinkedIn',
            verificationInfo: 'This certificate can be verified using the link below:',
            verifyCertificate: 'Verify Certificate',
            congratulations: 'Congratulations again on this achievement!',
            footer: 'Best regards, Flow Masters Team',
          }

    // Build the body content
    let bodyContent = `
      <h1>${texts.subject}</h1>
      <p>${texts.greeting}</p>
      <p>${texts.certificateInfo}</p>

      <div class="highlight-box">
        <p>${texts.completionDate}</p>
        <p>${texts.certificateId}</p>
        ${this.instructorName ? `<p>${texts.instructorNote}</p>` : ''}
      </div>

      <p>${texts.downloadPrompt}</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${this.certificateUrl}" class="button">${texts.viewCertificate}</a>
        <a href="${this.certificateUrl}?download=true" class="button" style="margin-left: 10px;">${texts.downloadCertificate}</a>
      </div>

      <p>${texts.linkedinPrompt}</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(this.courseName)}&organizationName=${encodeURIComponent('Flow Masters')}&issueYear=${new Date(this.completionDate).getFullYear()}&issueMonth=${new Date(this.completionDate).getMonth() + 1}&certUrl=${encodeURIComponent(this.shareableUrl)}" class="secondary-button" target="_blank">${texts.addToLinkedin}</a>
      </div>

      <p>${texts.verificationInfo}</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${this.shareableUrl}" class="secondary-button">${texts.verifyCertificate}</a>
      </div>

      <p>${texts.congratulations}</p>
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
 * Generate HTML for course certificate email
 */
export function generateCourseCertificateEmail(data: CourseCertificateEmailData): string {
  const email = new CourseCertificateEmail(data)
  return email.generateHTML()
}

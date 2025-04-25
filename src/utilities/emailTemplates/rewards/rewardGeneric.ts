import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate'

export interface RewardEmailData extends BaseEmailTemplateData {
  userName: string
  rewardTitle: string
  rewardDescription?: string
  rewardType: 'generic' | 'discount' | 'free_course' | 'badge' | 'certificate' | 'exclusive_content'
  rewardId: string
  rewardCode?: string
  expiresAt?: string
  rewardUrl?: string
}

/**
 * Email template for generic reward notification
 */
export class RewardGenericEmail extends BaseEmailTemplate<RewardEmailData> {
  protected userName: string
  protected rewardTitle: string
  protected rewardDescription?: string
  protected rewardType: string
  protected rewardId: string
  protected rewardCode?: string
  protected expiresAt?: string
  protected rewardUrl: string

  constructor(data: RewardEmailData) {
    super(data)
    this.userName = data.userName
    this.rewardTitle = data.rewardTitle
    this.rewardDescription = data.rewardDescription
    this.rewardType = data.rewardType
    this.rewardId = data.rewardId
    this.rewardCode = data.rewardCode
    this.expiresAt = data.expiresAt
    this.rewardUrl = data.rewardUrl || `${this.siteUrl}/${this.locale}/rewards/${this.rewardId}`
  }

  protected generateContent() {
    // Format expiration date if available
    const formattedExpirationDate = this.expiresAt 
      ? new Date(this.expiresAt).toLocaleDateString(
          this.locale === 'ru' ? 'ru-RU' : 'en-US',
          { year: 'numeric', month: 'long', day: 'numeric' }
        )
      : null

    // Localized texts
    const texts = this.locale === 'ru' ? {
      subject: `Вы получили награду: ${this.rewardTitle}`,
      greeting: `Здравствуйте, ${this.userName}!`,
      congratulations: 'Поздравляем! Вы получили новую награду:',
      expirationInfo: formattedExpirationDate ? `Срок действия: до ${formattedExpirationDate}` : '',
      rewardCode: this.rewardCode ? `Ваш код: ${this.rewardCode}` : '',
      viewRewards: 'Вы можете просмотреть все свои награды в личном кабинете.',
      buttonText: 'Перейти к наградам',
      supportInfo: 'Если у вас возникли вопросы по вашим наградам, пожалуйста, свяжитесь с нашей службой поддержки.',
      footer: 'С уважением, команда Flow Masters',
      unsubscribeNotice: 'Если вы не хотите получать уведомления о наградах, вы можете изменить настройки в личном кабинете.'
    } : {
      subject: `You've received a reward: ${this.rewardTitle}`,
      greeting: `Hello, ${this.userName}!`,
      congratulations: 'Congratulations! You have received a new reward:',
      expirationInfo: formattedExpirationDate ? `Expiration date: ${formattedExpirationDate}` : '',
      rewardCode: this.rewardCode ? `Your code: ${this.rewardCode}` : '',
      viewRewards: 'You can view all your rewards in your account dashboard.',
      buttonText: 'Go to Rewards',
      supportInfo: 'If you have any questions about your rewards, please contact our support team.',
      footer: 'Best regards, Flow Masters Team',
      unsubscribeNotice: 'If you do not want to receive reward notifications, you can change your settings in your account dashboard.'
    }

    // Build the body content
    let bodyContent = `
      <h1>${texts.subject}</h1>
      <p>${texts.greeting}</p>
      <p>${texts.congratulations}</p>
      
      <div class="highlight-box">
        <h2>${this.rewardTitle}</h2>
        ${this.rewardDescription ? `<p>${this.rewardDescription}</p>` : ''}
        
        ${this.rewardCode ? `
          <div class="code-box">
            ${this.rewardCode}
          </div>
        ` : ''}
        
        ${formattedExpirationDate ? `<p><strong>${texts.expirationInfo}</strong></p>` : ''}
      </div>
      
      <p>${texts.viewRewards}</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${this.rewardUrl}" class="button">${texts.buttonText}</a>
      </div>
      
      <p>${texts.supportInfo}</p>
    `

    const footerContent = `
      <p>${texts.footer}</p>
      <p><small>${texts.unsubscribeNotice}</small></p>
    `

    return {
      subject: texts.subject,
      bodyContent,
      footerContent
    }
  }
}

/**
 * Generate HTML for generic reward email
 */
export function generateRewardGenericEmail(data: RewardEmailData): string {
  const email = new RewardGenericEmail(data)
  return email.generateHTML()
}

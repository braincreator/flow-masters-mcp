import { BaseEmailTemplate } from '../baseEmailTemplate'
import { RewardEmailData, RewardGenericEmail } from './rewardGeneric'

/**
 * Email template for discount reward notification
 */
export class RewardDiscountEmail extends RewardGenericEmail {
  private discountAmount?: string
  private discountType?: 'percentage' | 'fixed'
  private applicableTo?: string

  constructor(data: RewardEmailData & { 
    discountAmount?: string,
    discountType?: 'percentage' | 'fixed',
    applicableTo?: string
  }) {
    super(data)
    this.discountAmount = data.discountAmount
    this.discountType = data.discountType
    this.applicableTo = data.applicableTo
  }

  protected generateContent() {
    // Get base content from parent class
    const baseContent = super.generateContent()
    
    // Localized texts
    const texts = this.locale === 'ru' ? {
      subject: `Вы получили скидку: ${this.rewardTitle}`,
      discountInfo: 'Информация о скидке:',
      discountAmount: this.discountAmount 
        ? `Размер скидки: ${this.discountAmount}${this.discountType === 'percentage' ? '%' : ' руб.'}` 
        : '',
      applicableTo: this.applicableTo 
        ? `Применимо к: ${this.applicableTo}` 
        : '',
      useCode: this.rewardCode 
        ? 'Используйте этот код при оформлении заказа, чтобы получить скидку.' 
        : '',
      browseCoursesButton: 'Просмотреть курсы',
    } : {
      subject: `You've received a discount: ${this.rewardTitle}`,
      discountInfo: 'Discount Information:',
      discountAmount: this.discountAmount 
        ? `Discount amount: ${this.discountAmount}${this.discountType === 'percentage' ? '%' : ' USD'}` 
        : '',
      applicableTo: this.applicableTo 
        ? `Applicable to: ${this.applicableTo}` 
        : '',
      useCode: this.rewardCode 
        ? 'Use this code during checkout to apply your discount.' 
        : '',
      browseCoursesButton: 'Browse Courses',
    }

    // Modify the subject
    baseContent.subject = texts.subject

    // Add discount-specific information to the body content
    let bodyContent = baseContent.bodyContent

    // Insert discount-specific information after the highlight-box div
    const insertPosition = bodyContent.indexOf('</div>', bodyContent.indexOf('highlight-box')) + 6

    const discountInfo = `
      <div style="margin-top: 20px;">
        <h3>${texts.discountInfo}</h3>
        ${this.discountAmount ? `<p>${texts.discountAmount}</p>` : ''}
        ${this.applicableTo ? `<p>${texts.applicableTo}</p>` : ''}
        ${this.rewardCode ? `<p>${texts.useCode}</p>` : ''}
      </div>
    `

    // Add browse courses button
    const browseCoursesButton = `
      <div style="text-align: center; margin: 20px 0;">
        <a href="${this.siteUrl}/${this.locale}/courses" class="button">${texts.browseCoursesButton}</a>
      </div>
    `

    bodyContent = bodyContent.slice(0, insertPosition) + discountInfo + bodyContent.slice(insertPosition)
    
    // Add browse courses button before the support info
    const supportInfoPosition = bodyContent.lastIndexOf('<p>')
    bodyContent = bodyContent.slice(0, supportInfoPosition) + browseCoursesButton + bodyContent.slice(supportInfoPosition)

    return {
      subject: baseContent.subject,
      bodyContent,
      footerContent: baseContent.footerContent
    }
  }
}

/**
 * Generate HTML for discount reward email
 */
export function generateRewardDiscountEmail(data: RewardEmailData & { 
  discountAmount?: string,
  discountType?: 'percentage' | 'fixed',
  applicableTo?: string
}): string {
  const email = new RewardDiscountEmail(data)
  return email.generateHTML()
}

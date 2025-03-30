import nodemailer from 'nodemailer'

export class EmailService {
  private transporter: any = null
  private sender: string = ''

  constructor() {
    try {
      // Get email configuration from environment variables
      const host = process.env.EMAIL_HOST
      const port = parseInt(process.env.EMAIL_PORT || '587', 10)
      const user = process.env.EMAIL_USER
      const pass = process.env.EMAIL_PASS
      const sender = process.env.EMAIL_SENDER || 'noreply@example.com'

      // Create a testing transporter if credentials not provided
      if (!host || !user || !pass) {
        console.warn('Email credentials not found. Using test account.')
        this.createTestAccount()
        return
      }

      // Create a production transporter
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      })

      this.sender = sender
    } catch (error) {
      console.error('Failed to initialize email service:', error)
      throw new Error('Email service initialization failed')
    }
  }

  private async createTestAccount() {
    try {
      // Create ethereal test account for development
      const testAccount = await nodemailer.createTestAccount()

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })

      this.sender = testAccount.user
      console.info('Created test email account:', testAccount.user)
    } catch (error) {
      console.error('Failed to create test email account:', error)
      throw new Error('Email test account creation failed')
    }
  }

  async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized')
      throw new Error('Email service not initialized')
    }

    try {
      const result = await this.transporter.sendMail({
        from: `"Store" <${this.sender}>`,
        to,
        subject,
        text: content,
        html: content.replace(/\n/g, '<br/>'),
      })

      // Log email preview URL for test accounts
      if (result.messageId && this.sender.includes('ethereal.email')) {
        console.info('Email preview URL:', nodemailer.getTestMessageUrl(result))
      }

      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  }
}

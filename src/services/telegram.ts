export class TelegramService {
  private botToken: string | null = null
  private chatId: string | null = null

  constructor() {
    try {
      // Get Telegram configuration from environment variables
      const botToken = process.env.TELEGRAM_BOT_TOKEN
      const chatId = process.env.TELEGRAM_CHAT_ID

      if (!botToken || !chatId) {
        console.warn('Telegram credentials not found. Service will be disabled.')
        return
      }

      this.botToken = botToken
      this.chatId = chatId
    } catch (error) {
      console.error('Failed to initialize Telegram service:', error)
      throw new Error('Telegram service initialization failed')
    }
  }

  async sendMessage(message: string): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      console.warn('Telegram service not configured, skipping message send')
      return false
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Telegram API error: ${error}`)
      }

      const result = await response.json()
      return result.ok === true
    } catch (error) {
      console.error('Failed to send Telegram message:', error)
      throw error
    }
  }
}

import type { Payload } from 'payload'
import { BaseService } from './base.service'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface TelegramConfig {
  botToken: string
  chatId: string
}

interface MessageOptions {
  parseMode?: 'HTML' | 'Markdown'
  disableWebPagePreview?: boolean
  disableNotification?: boolean
}

export class TelegramService extends BaseService {
  private static instance: TelegramService | null = null
  private botToken: string | null = null
  private chatId: string | null = null

 constructor(payload: Payload) {
    super(payload)
    this.initializeFromConfig()
  }

  public static getInstance(payload: Payload): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService(payload)
    }
    return TelegramService.instance
  }

  /**
   * Инициализирует конфигурацию Telegram из настроек
   */
  private async initializeFromConfig(): Promise<void> {
    try {
      // Получаем настройки уведомлений из базы данных
      const notificationSettings = await this.payload
        .findGlobal({
          slug: 'notification-settings',
        })
        .catch(() => null)

      // Если настройки найдены и есть конфигурация для Telegram
      if (notificationSettings?.telegram) {
        this.botToken = notificationSettings.telegram.botToken || null
        this.chatId = notificationSettings.telegram.chatId || null
      } else {
        // Используем переменные окружения, если настройки не найдены
        this.botToken = process.env.TELEGRAM_BOT_TOKEN || null
        this.chatId = process.env.TELEGRAM_CHAT_ID || null
      }

      // Проверяем, что все необходимые параметры заданы
      if (!this.botToken || !this.chatId) {
        logWarn('Telegram notification service is not fully configured')
      }
    } catch (error) {
      logError('Failed to initialize Telegram service:', error)
    }
  }

  /**
   * Отправляет сообщение в Telegram
   */
  async sendMessage(text: string, options: MessageOptions = {}): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      logWarn('Telegram service is not configured, message will not be sent')
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
          text,
          parse_mode: options.parseMode,
          disable_web_page_preview: options.disableWebPagePreview,
          disable_notification: options.disableNotification,
        }),
      })

      const data = await response.json()
      if (!data.ok) {
        logError('Telegram API error:', data.description)
        return false
      }

      return true
    } catch (error) {
      logError('Failed to send Telegram message:', error)
      return false
    }
  }
}

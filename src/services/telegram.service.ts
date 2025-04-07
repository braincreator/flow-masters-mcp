import type { Payload } from 'payload'
import { BaseService } from './base.service'

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

  private constructor(payload: Payload) {
    super(payload)
    this.initializeFromConfig()
  }

  public static getInstance(payload: Payload): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService(payload)
    }
    return TelegramService.instance
  }

  // Можно перенести реализацию из TelegramService.ts сюда
}

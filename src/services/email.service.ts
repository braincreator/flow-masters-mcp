import type { Payload } from 'payload'
import { BaseService } from './base.service'

export class EmailService extends BaseService {
  private static instance: EmailService | null = null

  private constructor(payload: Payload) {
    super(payload)
  }

  public static getInstance(payload: Payload): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService(payload)
    }
    return EmailService.instance
  }

  // Можно перенести реализацию из EmailService.ts сюда
}

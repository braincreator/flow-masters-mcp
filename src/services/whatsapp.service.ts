import type { Payload } from 'payload'
import { BaseService } from './base.service'

/**
 * Сервис для отправки WhatsApp уведомлений
 * Поддерживает WhatsApp Business API и WhatsApp Cloud API
 */
export class WhatsAppService extends BaseService {
  private static instance: WhatsAppService | null = null
  private readonly apiUrl: string
  private readonly accessToken: string
  private readonly phoneNumberId: string
  private readonly businessAccountId: string

  constructor(payload: Payload) {
    super(payload)
    
    // Настройки WhatsApp Business API
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0'
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || ''
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || ''
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || ''
    
    if (!this.accessToken || !this.phoneNumberId) {
      console.warn('WhatsApp service not configured. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID')
    }
  }

  public static getInstance(payload: Payload): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService(payload)
    }
    return WhatsAppService.instance
  }

  /**
   * Отправляет текстовое сообщение в WhatsApp
   */
  async sendMessage(
    phoneNumber: string,
    message: string,
    options: {
      previewUrl?: boolean
    } = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.isConfigured()) {
        throw new Error('WhatsApp service is not configured')
      }

      // Очищаем номер телефона (убираем все кроме цифр и +)
      const cleanPhoneNumber = this.cleanPhoneNumber(phoneNumber)
      
      if (!this.isValidPhoneNumber(cleanPhoneNumber)) {
        throw new Error('Invalid phone number format')
      }

      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhoneNumber,
        type: 'text',
        text: {
          body: message,
          preview_url: options.previewUrl || false,
        },
      }

      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send WhatsApp message')
      }

      console.log(`WhatsApp message sent to ${cleanPhoneNumber}:`, result.messages?.[0]?.id)

      return {
        success: true,
        messageId: result.messages?.[0]?.id,
      }

    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Отправляет сообщение с шаблоном
   */
  async sendTemplate(
    phoneNumber: string,
    templateName: string,
    languageCode: string = 'ru',
    parameters: string[] = []
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.isConfigured()) {
        throw new Error('WhatsApp service is not configured')
      }

      const cleanPhoneNumber = this.cleanPhoneNumber(phoneNumber)
      
      if (!this.isValidPhoneNumber(cleanPhoneNumber)) {
        throw new Error('Invalid phone number format')
      }

      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: parameters.length > 0 ? [
            {
              type: 'body',
              parameters: parameters.map(param => ({
                type: 'text',
                text: param,
              })),
            },
          ] : [],
        },
      }

      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send WhatsApp template')
      }

      console.log(`WhatsApp template sent to ${cleanPhoneNumber}:`, result.messages?.[0]?.id)

      return {
        success: true,
        messageId: result.messages?.[0]?.id,
      }

    } catch (error) {
      console.error('Error sending WhatsApp template:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Получает список доступных шаблонов
   */
  async getTemplates(): Promise<any[]> {
    try {
      if (!this.isConfigured()) {
        throw new Error('WhatsApp service is not configured')
      }

      const response = await fetch(
        `${this.apiUrl}/${this.businessAccountId}/message_templates`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to get WhatsApp templates')
      }

      return result.data || []

    } catch (error) {
      console.error('Error getting WhatsApp templates:', error)
      return []
    }
  }

  /**
   * Проверяет статус номера телефона
   */
  async checkPhoneNumber(phoneNumber: string): Promise<{
    valid: boolean
    whatsappId?: string
    error?: string
  }> {
    try {
      if (!this.isConfigured()) {
        throw new Error('WhatsApp service is not configured')
      }

      const cleanPhoneNumber = this.cleanPhoneNumber(phoneNumber)

      const response = await fetch(
        `${this.apiUrl}/${this.phoneNumberId}?fields=phone_number`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to check phone number')
      }

      return {
        valid: true,
        whatsappId: result.phone_number,
      }

    } catch (error) {
      console.error('Error checking WhatsApp phone number:', error)
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Проверяет, настроен ли сервис
   */
  private isConfigured(): boolean {
    return !!(this.accessToken && this.phoneNumberId)
  }

  /**
   * Очищает номер телефона
   */
  private cleanPhoneNumber(phoneNumber: string): string {
    // Убираем все символы кроме цифр и +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '')
    
    // Если номер начинается с 8, заменяем на +7 (для России)
    if (cleaned.startsWith('8')) {
      cleaned = '+7' + cleaned.substring(1)
    }
    
    // Если номер не начинается с +, добавляем +7 (для России по умолчанию)
    if (!cleaned.startsWith('+')) {
      cleaned = '+7' + cleaned
    }
    
    return cleaned
  }

  /**
   * Проверяет корректность номера телефона
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Базовая проверка: номер должен начинаться с + и содержать от 10 до 15 цифр
    const phoneRegex = /^\+\d{10,15}$/
    return phoneRegex.test(phoneNumber)
  }

  /**
   * Форматирует сообщение для WhatsApp
   */
  formatMessage(text: string, options: {
    bold?: string[]
    italic?: string[]
    monospace?: string[]
  } = {}): string {
    let formatted = text

    // WhatsApp поддерживает ограниченное форматирование
    if (options.bold) {
      options.bold.forEach(word => {
        formatted = formatted.replace(new RegExp(word, 'g'), `*${word}*`)
      })
    }

    if (options.italic) {
      options.italic.forEach(word => {
        formatted = formatted.replace(new RegExp(word, 'g'), `_${word}_`)
      })
    }

    if (options.monospace) {
      options.monospace.forEach(word => {
        formatted = formatted.replace(new RegExp(word, 'g'), `\`\`\`${word}\`\`\``)
      })
    }

    return formatted
  }
}

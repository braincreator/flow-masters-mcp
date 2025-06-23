import type { Payload } from 'payload'
import { BaseService } from './base.service'
import { generateSecurePassword } from '@/utilities/generatePassword'
import path from 'path'
import fs from 'fs'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export class AutoAccountService extends BaseService {
  constructor(payload: Payload) {
    super(payload)
  }

  /**
   * Создает аккаунт для пользователя на основе данных оплаты
   * @param email Email пользователя
   * @param name Имя пользователя (опционально)
   * @param orderId ID заказа (опционально)
   * @returns Объект с информацией о созданном аккаунте
   */
  async createAccountFromPayment(
    email: string,
    name?: string,
    orderId?: string
  ): Promise<{
    user: any
    password: string
    isNewUser: boolean
  }> {
    try {
      // Проверяем, существует ли пользователь с таким email
      const existingUsers = await this.payload.find({
        collection: 'users',
        where: {
          email: {
            equals: email,
          },
        },
      })

      // Если пользователь уже существует, возвращаем его
      if (existingUsers.docs.length > 0) {
        return {
          user: existingUsers.docs[0],
          password: '', // Не возвращаем пароль для существующего пользователя
          isNewUser: false,
        }
      }

      // Генерируем безопасный пароль
      const password = generateSecurePassword()

      // Создаем нового пользователя
      const user = await this.payload.create({
        collection: 'users',
        data: {
          email,
          name: name || email.split('@')[0], // Если имя не указано, используем часть email до @
          password,
        },
      })

      // Отправляем уведомление о создании аккаунта
      await this.sendAccountCreationEmail(email, name || email.split('@')[0], password, orderId)

      return {
        user,
        password,
        isNewUser: true,
      }
    } catch (error) {
      this.handleError(error, 'Failed to create account from payment')
      throw error
    }
  }

  /**
   * Отправляет email с уведомлением о создании аккаунта
   * @param email Email пользователя
   * @param name Имя пользователя
   * @param password Сгенерированный пароль
   * @param orderId ID заказа (опционально)
   */
  private async sendAccountCreationEmail(
    email: string,
    name: string,
    password: string,
    orderId?: string
  ): Promise<void> {
    try {
      // Получаем сервис для отправки email
      const emailService = await this.getEmailService()

      // Формируем URL для входа
      const loginUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/login`

      // Формируем URL для сброса пароля
      const resetPasswordUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password?email=${encodeURIComponent(
        email
      )}`

      // Загружаем шаблон email
      const templatePath = path.join(process.cwd(), 'src/email-templates/account-created.html')
      let template = fs.readFileSync(templatePath, 'utf8')

      // Заменяем переменные в шаблоне
      template = template
        .replace(/{{name}}/g, name)
        .replace(/{{email}}/g, email)
        .replace(/{{password}}/g, password)
        .replace(/{{loginUrl}}/g, loginUrl)
        .replace(/{{resetPasswordUrl}}/g, resetPasswordUrl)
        .replace(/{{currentYear}}/g, new Date().getFullYear().toString())

      // Отправляем email
      await emailService.sendEmail({
        to: email,
        subject: 'Ваш аккаунт на Flow Masters создан',
        html: template,
      })
    } catch (error) {
      logError('Failed to send account creation email:', error)
      // Не выбрасываем ошибку, чтобы не прерывать процесс создания аккаунта
    }
  }

  /**
   * Получает сервис для отправки email
   */
  private async getEmailService() {
    const serviceRegistry = await import('./service.registry')
    const registry = serviceRegistry.ServiceRegistry.getInstance(this.payload)
    return registry.getEmailService()
  }
}

import { CollectionConfig, PayloadRequest } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { ServiceRegistry } from '@/services/service.registry'
import { isAdminOrHasSiteAccess } from '@/access/isAdminOrHasSiteAccess'
import { generateUniqueToken } from '@/utilities/generateUniqueToken'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Тип для документа подписчика
interface SubscriberDoc {
  id: string
  email: string
  name?: string
  status: 'active' | 'unsubscribed' | 'bounced'
  unsubscribeToken: string
  locale?: string
  // ... другие поля
}

export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'createdAt'],
    group: 'Контент',
  },
  access: {
    read: () => true,
    create: () => true, // Разрешаем публичное создание для подписки
    update: isAdminOrHasSiteAccess, // Только админы могут обновлять
    delete: isAdmin, // Только админы могут удалять
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Генерируем уникальный токен для отписки при создании нового подписчика
        if (!data.unsubscribeToken) {
          return {
            ...data,
            unsubscribeToken: generateUniqueToken(),
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({
        doc,
        operation,
        req,
      }: {
        doc: SubscriberDoc
        operation: 'create' | 'update'
        req: PayloadRequest
      }) => {
        // Отправляем письма только при создании нового подписчика
        if (operation === 'create' && doc.status === 'active') {
          logDebug(`New subscriber created: ${doc.email}. Sending notifications...`)

          try {
            // Инициализируем ServiceRegistry и получаем EmailService
            const serviceRegistry = ServiceRegistry.getInstance(req.payload)
            const emailService = serviceRegistry.getEmailService()

            // Отправляем приветственное письмо подписчику
            emailService
              .sendWelcomeEmail({
                email: doc.email,
                name: doc.name,
                locale: doc.locale,
                unsubscribeToken: doc.unsubscribeToken,
              })
              .catch((err: Error) => {
                req.payload.logger.error(
                  `Failed to send welcome email to ${doc.email}: ${err.message}`,
                )
              })

            // Отправляем уведомление администратору
            emailService
              .sendAdminNewSubscriberNotification({
                newSubscriberEmail: doc.email,
                newSubscriberName: doc.name,
              })
              .catch((err: Error) => {
                // Логируем ошибку, но не прерываем процесс
                req.payload.logger.error(
                  `Failed to send admin notification for new subscriber ${doc.email}: ${err.message}`,
                )
              })
          } catch (error: any) {
            req.payload.logger.error(
              `Error initializing services for email notifications: ${error.message}`,
            )
          }
        }
        return doc // Хук afterChange должен возвращать документ
      },
      // Добавляем хук для событий подписок на рассылку
      async ({ doc, previousDoc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Событие подписки на рассылку
          await eventService.publishEvent('newsletter.subscribed', {
            id: doc.id,
            email: doc.email,
            name: doc.name,
            source: doc.source,
            locale: doc.locale,
            status: doc.status,
            subscribedAt: doc.createdAt,
          }, {
            source: 'newsletter_subscription',
            collection: 'newsletter-subscribers',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })
        } else if (operation === 'update' && previousDoc) {
          // Событие отписки от рассылки
          if (doc.status === 'unsubscribed' && previousDoc.status === 'active') {
            await eventService.publishEvent('newsletter.unsubscribed', {
              id: doc.id,
              email: doc.email,
              name: doc.name,
              source: doc.source,
              locale: doc.locale,
              previousStatus: previousDoc.status,
              unsubscribedAt: new Date().toISOString(),
            }, {
              source: 'newsletter_unsubscription',
              collection: 'newsletter-subscribers',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие повторной подписки
          if (doc.status === 'active' && previousDoc.status === 'unsubscribed') {
            await eventService.publishEvent('newsletter.resubscribed', {
              id: doc.id,
              email: doc.email,
              name: doc.name,
              source: doc.source,
              locale: doc.locale,
              previousStatus: previousDoc.status,
              resubscribedAt: new Date().toISOString(),
            }, {
              source: 'newsletter_resubscription',
              collection: 'newsletter-subscribers',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'Email адрес подписчика',
      },
    },
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Имя подписчика (опционально)',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        {
          label: 'Активный',
          value: 'active',
        },
        {
          label: 'Отписан',
          value: 'unsubscribed',
        },
        {
          label: 'Ошибка',
          value: 'bounced',
        },
      ],
      admin: {
        description: 'Статус подписки',
      },
    },
    {
      name: 'unsubscribeToken',
      type: 'text',
      unique: true,
      admin: {
        description: 'Уникальный токен для отписки',
        position: 'sidebar',
        readOnly: true,
      },
      access: {
        read: () => true,
        update: () => false, // Не разрешаем обновлять токен вручную
      },
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        description: 'Источник подписки (блог, главная страница и т.д.)',
      },
    },
    {
      name: 'locale',
      type: 'select',
      options: [
        {
          label: 'Русский',
          value: 'ru',
        },
        {
          label: 'English',
          value: 'en',
        },
      ],
      defaultValue: 'ru',
      admin: {
        description: 'Предпочитаемый язык',
      },
    },
    {
      name: 'lastSent',
      type: 'date',
      admin: {
        description: 'Дата последней отправки рассылки',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Дополнительные данные о подписчике',
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}

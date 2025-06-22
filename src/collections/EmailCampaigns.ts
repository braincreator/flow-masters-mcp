import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { ServiceRegistry } from '@/services/service.registry'

export const EmailCampaigns: CollectionConfig = {
  slug: 'email-campaigns',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'triggerType', 'createdAt'],
    group: 'Marketing & Communications',
  },
  labels: {
    singular: 'Email Campaign',
    plural: 'Email Campaigns',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Если кампания активирована, запускаем ее
        if (operation === 'update' && doc.status === 'active' && doc.triggerType === 'manual') {
          req.payload.logger.info(`Email campaign "${doc.name}" activated. Enqueueing job...`)
          try {
            // Ставим задачу в очередь
            await req.payload.jobs.queue({
              task: 'email-campaign',
              input: {
                campaignId: doc.id,
              },
            })

            // Обновляем статус кампании
            await req.payload.update({
              collection: 'email-campaigns',
              id: doc.id,
              data: {
                status: 'processing',
                lastRun: new Date().toISOString(),
              },
              overrideAccess: true,
              depth: 0,
            })
          } catch (error) {
            req.payload.logger.error(
              `Failed to enqueue job for email campaign "${doc.name}":`,
              error,
            )
          }
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'name',
      label: 'Название кампании',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Описание',
      type: 'textarea',
    },
    {
      name: 'status',
      label: 'Статус',
      type: 'select',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Активная', value: 'active' },
        { label: 'Выполняется', value: 'processing' },
        { label: 'Завершена', value: 'completed' },
        { label: 'Приостановлена', value: 'paused' },
        { label: 'Ошибка', value: 'error' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'triggerType',
      label: 'Тип запуска',
      type: 'select',
      options: [
        { label: 'Вручную', value: 'manual' },
        { label: 'По расписанию', value: 'schedule' },
        { label: 'По событию', value: 'event' },
      ],
      defaultValue: 'manual',
      required: true,
    },
    {
      name: 'schedule',
      label: 'Расписание',
      type: 'group',
      admin: {
        condition: (data) => data.triggerType === 'schedule',
      },
      fields: [
        {
          name: 'frequency',
          label: 'Частота',
          type: 'select',
          options: [
            { label: 'Однократно', value: 'once' },
            { label: 'Ежедневно', value: 'daily' },
            { label: 'Еженедельно', value: 'weekly' },
            { label: 'Ежемесячно', value: 'monthly' },
          ],
          defaultValue: 'once',
        },
        {
          name: 'startDate',
          label: 'Дата начала',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
          required: true,
        },
        {
          name: 'endDate',
          label: 'Дата окончания',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
            condition: (data, siblingData) => siblingData?.frequency !== 'once',
          },
        },
      ],
    },
    {
      name: 'eventTrigger',
      label: 'Событие-триггер',
      type: 'group',
      admin: {
        condition: (data) => data.triggerType === 'event',
      },
      fields: [
        {
          name: 'eventType',
          label: 'Тип события',
          type: 'select',
          options: [
            { label: 'Регистрация пользователя', value: 'user.registered' },
            { label: 'Создание заказа', value: 'order.created' },
            { label: 'Обновление статуса заказа', value: 'order.status.updated' },
            { label: 'Подписка на рассылку', value: 'newsletter.subscribed' },
            { label: 'Брошенная корзина', value: 'cart.abandoned' },
          ],
          required: true,
        },
        {
          name: 'delay',
          label: 'Задержка (в часах)',
          type: 'number',
          min: 0,
          defaultValue: 0,
        },
        {
          name: 'conditions',
          label: 'Дополнительные условия',
          type: 'json',
          admin: {
            description: 'JSON с условиями для фильтрации событий',
          },
        },
      ],
    },
    {
      name: 'targetAudience',
      label: 'Целевая аудитория',
      type: 'group',
      fields: [
        {
          name: 'audienceType',
          label: 'Тип аудитории',
          type: 'select',
          options: [
            { label: 'Все подписчики', value: 'all_subscribers' },
            { label: 'Сегмент пользователей', value: 'user_segment' },
            { label: 'Пользователи по фильтру', value: 'user_filter' },
            { label: 'Связано с событием', value: 'event_related' },
          ],
          defaultValue: 'all_subscribers',
          required: true,
        },
        {
          name: 'segment',
          label: 'Сегмент пользователей',
          type: 'relationship',
          relationTo: 'user-segments',
          hasMany: false,
          admin: {
            condition: (data, siblingData) => siblingData?.audienceType === 'user_segment',
          },
        },
        {
          name: 'filter',
          label: 'Фильтр пользователей',
          type: 'json',
          admin: {
            description: 'JSON с условиями для фильтрации пользователей',
            condition: (data, siblingData) => siblingData?.audienceType === 'user_filter',
          },
        },
        {
          name: 'locale',
          label: 'Локаль',
          type: 'select',
          options: [
            { label: 'Все', value: '' },
            { label: 'Русский', value: 'ru' },
            { label: 'English', value: 'en' },
          ],
          defaultValue: '',
        },
      ],
    },
    // {
    //   name: 'emailSequence',
    //   label: 'Последовательность писем',
    //   type: 'array',
    //   minRows: 1,
    //   fields: [
    //     {
    //       name: 'template',
    //       label: 'Шаблон письма',
    //       type: 'relationship',
    //       relationTo: 'email-templates',
    //       required: true,
    //     },
    //     {
    //       name: 'delay',
    //       label: 'Задержка (в часах)',
    //       type: 'number',
    //       min: 0,
    //       defaultValue: 0,
    //       admin: {
    //         description:
    //           'Задержка перед отправкой этого письма (от начала кампании или предыдущего письма)',
    //       },
    //     },
    //     {
    //       name: 'condition',
    //       label: 'Условие отправки',
    //       type: 'json',
    //       admin: {
    //         description: 'JSON с условиями, при которых это письмо будет отправлено',
    //       },
    //     },
    //   ],
    // },
    {
      name: 'lastRun',
      label: 'Последний запуск',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'stats',
      label: 'Статистика',
      type: 'group',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'totalSent',
          label: 'Всего отправлено',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'opened',
          label: 'Открыто',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'clicked',
          label: 'Кликнуто',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'bounced',
          label: 'Отказов',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'unsubscribed',
          label: 'Отписок',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'logs',
      label: 'Логи',
      type: 'array',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'timestamp',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'message',
          type: 'text',
        },
        {
          name: 'level',
          type: 'select',
          options: [
            { label: 'Info', value: 'info' },
            { label: 'Warning', value: 'warning' },
            { label: 'Error', value: 'error' },
            { label: 'Success', value: 'success' },
          ],
          defaultValue: 'info',
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      // Добавляем хук для событий email кампаний
      async ({ doc, previousDoc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Событие создания кампании
          await eventService.publishEvent('campaign.created', {
            id: doc.id,
            name: doc.name,
            description: doc.description,
            triggerType: doc.triggerType,
            status: doc.status,
            targetAudience: doc.targetAudience,
            createdAt: doc.createdAt,
          }, {
            source: 'campaign_creation',
            collection: 'email-campaigns',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })
        } else if (operation === 'update' && previousDoc) {
          // Событие запуска кампании
          if (doc.status === 'active' && previousDoc.status === 'draft') {
            await eventService.publishEvent('campaign.started', {
              id: doc.id,
              name: doc.name,
              description: doc.description,
              triggerType: doc.triggerType,
              targetAudience: doc.targetAudience,
              startedAt: new Date().toISOString(),
            }, {
              source: 'campaign_start',
              collection: 'email-campaigns',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие завершения кампании
          if (doc.status === 'completed' && previousDoc.status === 'active') {
            const openRate = doc.stats?.totalSent ? (doc.stats.opened / doc.stats.totalSent * 100) : 0
            const clickRate = doc.stats?.totalSent ? (doc.stats.clicked / doc.stats.totalSent * 100) : 0

            await eventService.publishEvent('campaign.completed', {
              id: doc.id,
              name: doc.name,
              description: doc.description,
              triggerType: doc.triggerType,
              targetAudience: doc.targetAudience,
              stats: doc.stats,
              openRate: Math.round(openRate * 100) / 100,
              clickRate: Math.round(clickRate * 100) / 100,
              completedAt: new Date().toISOString(),
            }, {
              source: 'campaign_completion',
              collection: 'email-campaigns',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })

            // Событие высокого open rate (>25%)
            if (openRate > 25) {
              await eventService.publishEvent('campaign.high_open_rate', {
                id: doc.id,
                name: doc.name,
                openRate,
                stats: doc.stats,
              }, {
                source: 'campaign_high_performance',
                collection: 'email-campaigns',
                operation,
                userId: req.user?.id,
                userEmail: req.user?.email,
              })
            }

            // Событие низкого open rate (<10%)
            if (openRate < 10 && doc.stats?.totalSent > 10) {
              await eventService.publishEvent('campaign.low_open_rate', {
                id: doc.id,
                name: doc.name,
                openRate,
                stats: doc.stats,
              }, {
                source: 'campaign_low_performance',
                collection: 'email-campaigns',
                operation,
                userId: req.user?.id,
                userEmail: req.user?.email,
              })
            }
          }
        }
      },
    ],
  },
  timestamps: true,
}

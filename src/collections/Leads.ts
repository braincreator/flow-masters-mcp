import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { anyone } from '@/access/anyone'
import { ServiceRegistry } from '@/services/service.registry'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'email', 'actionType', 'source', 'createdAt'],
    group: 'Marketing',
    description: 'Лиды с AI Agency Landing и других форм',
  },
  labels: {
    singular: 'Лид',
    plural: 'Лиды',
  },
  access: {
    read: isAdmin,
    create: anyone, // Разрешаем публичное создание для форм
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Имя',
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Телефон',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
    },
    {
      name: 'comment',
      type: 'textarea',
      label: 'Комментарий',
    },
    {
      name: 'actionType',
      type: 'text',
      label: 'Тип действия',
      admin: {
        description: 'Тип кнопки или действия, которое привело к созданию лида',
      },
    },
    {
      name: 'source',
      type: 'text',
      label: 'Источник',
      admin: {
        description: 'URL страницы или источник лида',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      label: 'Дополнительные данные',
      admin: {
        description: 'Дополнительная информация о лиде (результаты калькулятора, выбранный тариф и т.д.)',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      defaultValue: 'new',
      options: [
        { label: 'Новый', value: 'new' },
        { label: 'В работе', value: 'in_progress' },
        { label: 'Обработан', value: 'processed' },
        { label: 'Закрыт', value: 'closed' },
      ],
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      label: 'Назначен',
      admin: {
        description: 'Пользователь, ответственный за обработку лида',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Заметки',
      admin: {
        description: 'Внутренние заметки по лиду',
      },
    },
  ],
  timestamps: true,
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          const serviceRegistry = ServiceRegistry.getInstance(req.payload)

          // Новая система событий
          const eventService = serviceRegistry.getEventService()
          if (eventService) {
            await eventService.publishEvent('lead.created', {
              id: doc.id,
              name: doc.name,
              phone: doc.phone,
              email: doc.email,
              comment: doc.comment,
              actionType: doc.actionType,
              source: doc.source,
              metadata: doc.metadata,
              status: doc.status,
              assignedTo: doc.assignedTo,
              createdAt: doc.createdAt,
            }, {
              source: 'lead_creation',
              collection: 'leads',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }
        }

        if (operation === 'update') {
          const serviceRegistry = ServiceRegistry.getInstance(req.payload)

          // Событие обновления лида
          const eventService = serviceRegistry.getEventService()
          if (eventService) {
            await eventService.publishEvent('lead.updated', {
              id: doc.id,
              name: doc.name,
              phone: doc.phone,
              email: doc.email,
              status: doc.status,
              assignedTo: doc.assignedTo,
              updatedAt: doc.updatedAt,
            }, {
              source: 'lead_update',
              collection: 'leads',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })

            // Специальное событие при конвертации лида
            if (doc.status === 'processed') {
              await eventService.publishEvent('lead.converted', {
                id: doc.id,
                name: doc.name,
                phone: doc.phone,
                email: doc.email,
                source: doc.source,
                actionType: doc.actionType,
                convertedAt: new Date().toISOString(),
              }, {
                source: 'lead_conversion',
                collection: 'leads',
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
}

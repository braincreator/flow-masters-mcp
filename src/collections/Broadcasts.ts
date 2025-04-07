import { CollectionConfig, PayloadRequest } from 'payload'
import { isAdmin } from '@/access/isAdmin'

// Тип документа для broadcast
interface BroadcastDoc {
  id: string
  title: string
  content: any // Lexical JSON
  locale?: string
  status: 'draft' | 'queued' | 'sent' | 'failed' // Отслеживаем статус
  report?: string | Record<string, unknown> // Связь с отчетом
}

export const Broadcasts: CollectionConfig = {
  slug: 'broadcasts',
  admin: {
    useAsTitle: 'title',
    description: 'Создание и запуск массовых рассылок новостей.',
    defaultColumns: ['title', 'status', 'locale', 'createdAt'],
    group: 'Рассылки', // Новая группа для удобства
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    // Хук после создания документа
    afterChange: [
      async ({
        doc,
        previousDoc,
        operation,
        req,
      }: {
        doc: BroadcastDoc
        previousDoc: BroadcastDoc
        operation: 'create' | 'update'
        req: PayloadRequest
      }) => {
        // Запускаем задачу только при ПЕРВОМ создании документа
        // (чтобы избежать повторного запуска при редактировании)
        if (operation === 'create') {
          req.payload.logger.info(`New broadcast created: "${doc.title}". Enqueueing job...`)
          try {
            // Ставим задачу в очередь
            await req.payload.jobs.queue({
              task: 'newsletter-broadcast',
              input: {
                title: doc.title,
                content: JSON.stringify(doc.content), // Передаем контент как строку JSON
                locale: doc.locale,
              },
            })

            // Обновляем статус самой рассылки на 'queued' (в очереди)
            // Делаем это без вызова хуков, чтобы не зациклиться
            await req.payload.update({
              collection: 'broadcasts',
              id: doc.id,
              data: { status: 'queued' },
              overrideAccess: true, // Обходим проверки доступа
              depth: 0,
            })
            req.payload.logger.info(`Broadcast "${doc.title}" status updated to queued.`)
          } catch (error: any) {
            req.payload.logger.error(
              `Failed to enqueue job for broadcast "${doc.title}": ${error.message}`,
            )
            // Можно обновить статус на 'failed' здесь, если нужно
            await req.payload.update({
              collection: 'broadcasts',
              id: doc.id,
              data: { status: 'failed' },
              overrideAccess: true,
              depth: 0,
            })
          }
        }
        // Возвращаем документ (хотя для afterChange это не обязательно)
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'title',
      label: 'Тема Рассылки',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      label: 'Содержимое Письма',
      type: 'richText', // Используем richText для удобного редактирования
      required: true,
    },
    {
      name: 'locale',
      label: 'Локаль',
      type: 'select',
      options: [
        { label: 'Все', value: '' }, // Пустое значение для отправки всем
        { label: 'Русский', value: 'ru' },
        { label: 'English', value: 'en' },
      ],
      admin: {
        description:
          'Выберите язык для целевой аудитории или "Все" для отправки всем активным подписчикам.',
      },
    },
    {
      name: 'status',
      label: 'Статус',
      type: 'select',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'В очереди', value: 'queued' },
        { label: 'Отправлено (Завершено)', value: 'sent' }, // Статус будет обновляться по завершению задачи
        { label: 'Ошибка', value: 'failed' },
      ],
      defaultValue: 'draft',
      admin: {
        readOnly: true, // Статус меняется автоматически
        position: 'sidebar',
      },
    },
    // Опционально: Связь с отчетом
    {
      name: 'report',
      label: 'Отчет о Рассылке',
      type: 'relationship',
      relationTo: 'broadcast-reports',
      hasMany: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Ссылка на детальный отчет после завершения задачи.',
      },
      // Можно добавить хук для автоматического связывания после завершения задачи
    },
  ],
  timestamps: true,
}

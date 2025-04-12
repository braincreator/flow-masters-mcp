import type { CollectionConfig } from 'payload'
// Re-import availableBlocks
import { availableBlocks } from '../../blocks'

export const Popups: CollectionConfig = {
  slug: 'popups',
  admin: {
    useAsTitle: 'title', // Используем title, если он есть, иначе popupId
    defaultColumns: ['title', 'popupId', 'updatedAt'],
    description: 'Коллекция для хранения содержимого всплывающих окон (попапов).',
  },
  labels: {
    singular: 'Попап (Содержимое)',
    plural: 'Попапы (Содержимое)',
  },
  fields: [
    {
      name: 'popupId',
      type: 'text',
      label: 'Идентификатор Попапа',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          "Уникальный ID (латиница, цифры, дефисы). Используется для связи с блоком 'Конфигуратор Попапа' на страницах.",
      },
      // Валидация формата ID
      validate: (value) => {
        if (typeof value === 'string' && /^[a-zA-Z0-9-]+$/.test(value)) {
          return true
        }
        return 'Идентификатор должен содержать только латинские буквы, цифры и дефис.'
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Название попапа (для админки)',
      admin: {
        description: 'Внутреннее название для удобства поиска и управления.',
      },
    },
    {
      name: 'content',
      type: 'blocks',
      label: 'Содержимое Попапа',
      minRows: 1,
      // Re-add explicit blocks list
      blocks: availableBlocks,
      required: true,
    },
    // Можно добавить опции для внешнего вида самого контейнера попапа,
    // если это не управляется на фронтенде глобально:
    // {
    //   name: 'maxWidth',
    //   type: 'select',
    //   label: 'Максимальная ширина попапа',
    //   options: [...]
    // },
    // {
    //   name: 'showCloseButton',
    //   type: 'checkbox',
    //   label: 'Показывать кнопку закрытия',
    //   defaultValue: true
    // }
  ],
}

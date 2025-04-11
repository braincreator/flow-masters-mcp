import type { Block, Field } from 'payload'

// Поле для ссылки (внутренняя страница или внешний URL) - переиспользуем из DiscussionForum
const linkField: Field = {
  name: 'link',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'radio',
      options: [
        {
          label: 'Внутренняя страница',
          value: 'reference',
        },
        {
          label: 'Внешний URL',
          value: 'custom',
        },
      ],
      defaultValue: 'custom',
      admin: {
        layout: 'horizontal',
      },
    },
    {
      name: 'label',
      label: 'Текст ссылки',
      type: 'text',
      required: true,
    },
    {
      name: 'reference',
      label: 'Страница',
      type: 'relationship',
      relationTo: 'pages',
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
      },
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
      },
    },
  ],
}

export const AchievementsBlock: Block = {
  slug: 'achievementsBlock', // Отличаем от коллекции
  interfaceName: 'AchievementsBlockType',
  labels: {
    singular: 'Блок Достижений',
    plural: 'Блоки Достижений',
  },
  fields: [
    {
      name: 'blockTitle',
      type: 'text',
      label: 'Заголовок блока (опционально)',
    },
    {
      name: 'displayMode',
      type: 'select',
      label: 'Режим отображения',
      defaultValue: 'userSpecific',
      options: [
        { label: 'Достижения текущего пользователя', value: 'userSpecific' },
        { label: 'Все доступные достижения', value: 'allAvailable' },
        { label: 'Конкретные достижения', value: 'specificAchievements' },
      ],
      admin: {
        description:
          'Выберите, какие достижения показывать. Логика получения данных реализуется на фронтенде.',
      },
    },
    {
      name: 'achievementsToShow',
      type: 'relationship',
      relationTo: 'achievements',
      hasMany: true,
      label: 'Выбрать достижения',
      admin: {
        condition: (_, siblingData) => siblingData.displayMode === 'specificAchievements',
      },
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Стиль отображения',
      defaultValue: 'grid',
      options: [
        { label: 'Сетка', value: 'grid' },
        { label: 'Список', value: 'list' },
      ],
    },
    {
      name: 'limit',
      type: 'number',
      label: 'Максимальное количество для показа (0 = все)',
      defaultValue: 6,
      min: 0,
    },
    {
      name: 'showLockedState',
      type: 'checkbox',
      label: "Показывать неоткрытые достижения (для режимов 'Все' и 'Конкретные')",
      defaultValue: true,
      admin: {
        condition: (_, siblingData) => siblingData.displayMode !== 'userSpecific',
      },
    },
    {
      name: 'viewAllLink',
      label: "Ссылка на страницу 'Все достижения' (опционально)",
      type: 'group',
      fields: linkField.fields,
    },
    // Примечание: Логика получения и отображения достижений пользователя
    // (проверка, какие из них открыты) должна быть реализована на фронтенде,
    // вероятно, с использованием данных о пользователе и коллекции 'achievements'.
  ],
}

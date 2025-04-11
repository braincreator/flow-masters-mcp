import type { Block } from 'payload'

export const Recommendations: Block = {
  slug: 'recommendations',
  interfaceName: 'RecommendationsBlock',
  labels: {
    singular: 'Рекомендации',
    plural: 'Рекомендации',
  },
  fields: [
    {
      name: 'blockTitle',
      type: 'text',
      label: "Заголовок блока (напр. 'Вам также может понравиться')",
      defaultValue: 'Рекомендуем также',
    },
    {
      name: 'recommendationType',
      type: 'select',
      label: 'Тип рекомендаций',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: 'Ручной выбор', value: 'manual' },
        { label: 'Похожие (по тегам/категориям)', value: 'related' },
        { label: 'Популярные', value: 'popular' },
        { label: 'Персональные (для пользователя)', value: 'userBased' },
        { label: 'На основе текущего контента', value: 'contentBased' },
      ],
      admin: {
        description:
          'Выберите тип. Автоматические типы требуют логики на фронтенде/бэкенде для подбора.',
      },
    },
    {
      name: 'sourceCollection',
      type: 'select',
      label: 'Источник данных (Коллекция)',
      required: true,
      options: [
        // Динамически сюда можно добавить все коллекции, имеющие смысл
        // для рекомендаций (например, из payload.config)
        // Пока что захардкодим основные
        { label: 'Курсы', value: 'courses' },
        { label: 'Статьи/Посты', value: 'posts' },
        { label: 'Продукты', value: 'products' },
        { label: 'Проекты', value: 'projects' },
        { label: 'Ресурсы', value: 'resources' }, // Если есть такая коллекция
        { label: 'Мероприятия', value: 'events' },
      ],
    },
    {
      name: 'manualRecommendations',
      type: 'relationship',
      label: 'Выбрать элементы вручную',
      // `relationTo` будет зависеть от `sourceCollection`
      // Payload пока не поддерживает динамический `relationTo` в UI,
      // поэтому здесь нужен кастомный компонент или показывать все опции,
      // а валидировать на уровне хуков.
      // Простой вариант: используем `relationTo` как массив всех возможных коллекций.
      relationTo: ['courses', 'posts', 'products', 'projects', 'resources', 'events'],
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData.recommendationType === 'manual',
        description: 'Выберите элементы из указанной выше коллекции.',
      },
      filterOptions: ({ siblingData }) => {
        // Фильтруем для UI, чтобы показывать только релевантные связи
        if (siblingData.sourceCollection) {
          return {
            id: {
              // Этот фильтр будет работать только если есть кастомный компонент
              // или если фронтенд умеет фильтровать по типу коллекции
              in: [], // Неэффективно, нужен другой подход
            },
          }
        }
        return {}
      },
    },
    {
      name: 'limit',
      type: 'number',
      label: 'Количество рекомендаций',
      defaultValue: 3,
      min: 1,
      max: 12,
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Стиль отображения',
      defaultValue: 'cards',
      options: [
        { label: 'Карточки', value: 'cards' },
        { label: 'Список', value: 'list' },
        { label: 'Карусель', value: 'carousel' },
      ],
    },
    // Дополнительные опции для автоматических режимов (если нужно)
    // {
    //   name: 'popularityPeriod',
    //   type: 'select',
    //   label: 'Период для популярных',
    //   options: [...],
    //   admin: {
    //     condition: (_, siblingData) => siblingData.recommendationType === 'popular',
    //   }
    // }
  ],
}

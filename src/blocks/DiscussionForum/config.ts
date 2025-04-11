import type { Block, Field } from 'payload'

// Поле для ссылки (внутренняя страница или внешний URL)
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
      relationTo: 'pages', // Предполагаем, что есть коллекция 'pages'
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

export const DiscussionForum: Block = {
  slug: 'discussionForum',
  interfaceName: 'DiscussionForumBlock',
  labels: {
    singular: 'Форум/Сообщество',
    plural: 'Форумы/Сообщества',
  },
  fields: [
    {
      name: 'blockTitle',
      type: 'text',
      label: 'Заголовок блока (опционально)',
    },
    {
      name: 'forumSourceType',
      type: 'select',
      label: 'Источник тем для отображения',
      defaultValue: 'latestTopics',
      options: [
        { label: 'Последние темы', value: 'latestTopics' },
        { label: 'Темы из категории', value: 'categoryTopics' },
        // Можно добавить 'Конкретные темы' и поле relationship many
      ],
      admin: {
        description:
          'Выберите, какие темы показывать. Логика получения данных реализуется на фронтенде.',
      },
    },
    {
      name: 'forumCategory',
      type: 'relationship',
      relationTo: 'forum-categories', // Предполагаем наличие коллекции 'forum-categories'
      label: 'Категория форума',
      admin: {
        condition: (data, siblingData) => siblingData.forumSourceType === 'categoryTopics',
        description: 'Выберите категорию, из которой показывать темы.',
      },
      // required: true // Сделать обязательным, если выбран тип 'categoryTopics'
    },
    {
      name: 'topicLimit',
      type: 'number',
      label: 'Количество тем для отображения',
      defaultValue: 5,
      min: 1,
      max: 20, // Ограничение для производительности
    },
    {
      name: 'displayOptions',
      type: 'group',
      label: 'Отображаемая информация',
      fields: [
        {
          name: 'showAuthor',
          type: 'checkbox',
          label: 'Показывать автора',
          defaultValue: true,
        },
        {
          name: 'showReplyCount',
          type: 'checkbox',
          label: 'Показывать количество ответов',
          defaultValue: true,
        },
        {
          name: 'showLastActivity',
          type: 'checkbox',
          label: 'Показывать дату последнего сообщения',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'viewForumLink',
      label: 'Ссылка на весь форум',
      type: 'group',
      fields: linkField.fields, // Используем переиспользуемое поле
    },
    {
      name: 'newTopicLink',
      label: 'Ссылка на создание новой темы',
      type: 'group',
      fields: linkField.fields, // Используем переиспользуемое поле
    },
    // Примечание: Этот блок только конфигурирует отображение.
    // Реальная загрузка и отображение тем форума должна быть реализована
    // в соответствующем frontend-компоненте, который будет использовать
    // forumSourceType, forumCategory и topicLimit для запроса данных
    // из коллекций 'forum-topics'/'forum-threads' (которые нужно создать).
  ],
}

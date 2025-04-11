import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Leaderboard: Block = {
  slug: 'leaderboard',
  interfaceName: 'LeaderboardBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока рейтинга/лидерборда',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Краткое описание таблицы лидеров',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Общее описание или правила лидерборда',
      },
    },
    {
      name: 'leaderboardType',
      type: 'select',
      label: 'Тип лидерборда',
      defaultValue: 'points',
      options: [
        { label: 'По баллам/опыту', value: 'points' },
        { label: 'По завершенным курсам', value: 'coursesCompleted' },
        { label: 'По достижениям', value: 'achievements' },
        { label: 'По активности', value: 'activity' }, // Например, количество комментариев, посещений
        { label: 'Пользовательский', value: 'custom' }, // Если логика подсчета сложная или внешняя
      ],
    },
    {
      name: 'dataSource',
      type: 'select',
      label: 'Источник данных',
      defaultValue: 'usersCollection',
      options: [
        { label: 'Коллекция пользователей', value: 'usersCollection' },
        { label: 'Отдельная коллекция рейтинга', value: 'leaderboardCollection' },
        { label: 'API', value: 'api' },
      ],
    },
    {
      name: 'usersCollectionSettings',
      type: 'group',
      label: 'Настройки коллекции пользователей',
      admin: {
        condition: (data, siblingData) => siblingData?.dataSource === 'usersCollection',
      },
      fields: [
        {
          name: 'scoreField',
          type: 'text',
          label: 'Поле с баллами',
          required: true,
          defaultValue: 'points',
          admin: {
            description: 'Название поля в коллекции пользователей, по которому строится рейтинг',
          },
        },
        {
          name: 'period',
          type: 'select',
          label: 'Период рейтинга',
          defaultValue: 'allTime',
          options: [
            { label: 'За все время', value: 'allTime' },
            { label: 'За последнюю неделю', value: 'weekly' },
            { label: 'За последний месяц', value: 'monthly' },
            { label: 'За последний год', value: 'yearly' },
            { label: 'Пользовательский период', value: 'customPeriod' }, // Потребует дополнительной логики
          ],
        },
        {
          name: 'filter',
          type: 'textarea',
          label: 'Фильтр пользователей (JSON)',
          admin: {
            description: 'Payload Where-условие для фильтрации участников рейтинга',
          },
        },
      ],
    },
    {
      name: 'leaderboardCollectionSettings',
      type: 'group',
      label: 'Настройки коллекции рейтинга',
      admin: {
        condition: (data, siblingData) => siblingData?.dataSource === 'leaderboardCollection',
      },
      fields: [
        {
          name: 'collection',
          type: 'text',
          label: 'Название коллекции',
          required: true,
          defaultValue: 'leaderboardEntries',
        },
        {
          name: 'userRelationField',
          type: 'text',
          label: 'Поле связи с пользователем',
          required: true,
          defaultValue: 'user',
        },
        {
          name: 'scoreField',
          type: 'text',
          label: 'Поле с баллами',
          required: true,
          defaultValue: 'score',
        },
        {
          name: 'periodField',
          type: 'text',
          label: 'Поле с периодом (если применимо)',
        },
        {
          name: 'filter',
          type: 'textarea',
          label: 'Фильтр записей (JSON)',
        },
      ],
    },
    {
      name: 'apiSettings',
      type: 'group',
      label: 'Настройки API',
      admin: {
        condition: (data, siblingData) => siblingData?.dataSource === 'api',
      },
      fields: [
        {
          name: 'apiUrl',
          type: 'text',
          label: 'URL API для получения рейтинга',
          required: true,
        },
        {
          name: 'apiKey',
          type: 'text',
          label: 'API ключ',
        },
        {
          name: 'responseMapping',
          type: 'group',
          label: 'Маппинг ответа API',
          fields: [
            { name: 'items', type: 'text', label: 'Путь к массиву записей', defaultValue: 'data' },
            {
              name: 'userName',
              type: 'text',
              label: 'Поле: Имя пользователя',
              defaultValue: 'userName',
            },
            { name: 'userAvatar', type: 'text', label: 'Поле: Аватар', defaultValue: 'avatarUrl' },
            { name: 'score', type: 'text', label: 'Поле: Баллы', defaultValue: 'score' },
            { name: 'rank', type: 'text', label: 'Поле: Ранг (опционально)', defaultValue: 'rank' },
          ],
        },
      ],
    },
    {
      name: 'displaySettings',
      type: 'group',
      label: 'Настройки отображения',
      fields: [
        {
          name: 'limit',
          type: 'number',
          label: 'Количество отображаемых позиций',
          defaultValue: 10,
          min: 1,
        },
        {
          name: 'showRank',
          type: 'checkbox',
          label: 'Показывать ранг/место',
          defaultValue: true,
        },
        {
          name: 'showAvatar',
          type: 'checkbox',
          label: 'Показывать аватар',
          defaultValue: true,
        },
        {
          name: 'showScore',
          type: 'checkbox',
          label: 'Показывать баллы',
          defaultValue: true,
        },
        {
          name: 'scoreLabel',
          type: 'text',
          label: 'Метка для баллов',
          defaultValue: 'Баллы',
          admin: {
            condition: (data, siblingData) => siblingData?.showScore,
          },
        },
        {
          name: 'highlightCurrentUser',
          type: 'checkbox',
          label: 'Выделять текущего пользователя',
          defaultValue: true,
        },
        {
          name: 'currentUserPosition',
          type: 'select',
          label: 'Показывать позицию текущего пользователя',
          defaultValue: 'ifNotInTop',
          options: [
            { label: 'Всегда внизу', value: 'alwaysBottom' },
            { label: 'Только если не в топе', value: 'ifNotInTop' },
            { label: 'Не показывать отдельно', value: 'never' },
          ],
          admin: {
            condition: (data, siblingData) => siblingData?.highlightCurrentUser,
          },
        },
        {
          name: 'refreshInterval',
          type: 'number',
          label: 'Интервал автообновления (секунды, 0 - отключено)',
          defaultValue: 0,
        },
        {
          name: 'pagination',
          type: 'checkbox',
          label: 'Включить пагинацию (если > лимита)',
          defaultValue: false,
        },
        {
          name: 'emptyStateMessage',
          type: 'text',
          label: 'Сообщение при пустом рейтинге',
          defaultValue: 'Пока нет данных для отображения рейтинга.',
        },
      ],
    },
  ],
}

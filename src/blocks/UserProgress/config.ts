import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const UserProgress: Block = {
  slug: 'userProgress',
  interfaceName: 'UserProgressBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока прогресса',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Подзаголовок или краткое описание блока',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Общее описание блока прогресса',
      },
    },
    {
      name: 'displayType',
      type: 'select',
      label: 'Тип отображения',
      defaultValue: 'dashboard',
      options: [
        { label: 'Дашборд', value: 'dashboard' },
        { label: 'Прогресс-бар', value: 'progressBar' },
        { label: 'График', value: 'chart' },
        { label: 'Достижения', value: 'achievements' },
      ],
    },
    {
      name: 'dataSource',
      type: 'select',
      label: 'Источник данных',
      defaultValue: 'user',
      options: [
        { label: 'Данные пользователя', value: 'user' },
        { label: 'Статические данные', value: 'static' },
        { label: 'API', value: 'api' },
      ],
    },
    {
      name: 'staticData',
      type: 'array',
      label: 'Статические данные',
      admin: {
        condition: (data, siblingData) => siblingData?.dataSource === 'static',
        description: 'Задать данные прогресса вручную',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Название',
          required: true,
        },
        {
          name: 'value',
          type: 'number',
          label: 'Значение',
          required: true,
          min: 0,
          max: 100,
        },
        {
          name: 'maxValue',
          type: 'number',
          label: 'Максимальное значение',
          defaultValue: 100,
        },
        {
          name: 'color',
          type: 'text',
          label: 'Цвет',
          admin: {
            description: 'HEX, RGB или название цвета',
          },
        },
        {
          name: 'icon',
          type: 'text',
          label: 'Иконка',
          admin: {
            description: 'Название иконки из библиотеки или URL',
          },
        },
      ],
    },
    {
      name: 'userDataFields',
      type: 'array',
      label: 'Поля данных пользователя',
      admin: {
        condition: (data, siblingData) => siblingData?.dataSource === 'user',
        description: 'Поля данных пользователя для отображения',
      },
      fields: [
        {
          name: 'field',
          type: 'text',
          label: 'Поле',
          required: true,
          admin: {
            description: 'Поле из коллекции пользователей или связанной коллекции',
          },
        },
        {
          name: 'label',
          type: 'text',
          label: 'Отображаемое название',
          required: true,
        },
        {
          name: 'fieldType',
          type: 'select',
          label: 'Тип поля',
          defaultValue: 'percent',
          options: [
            { label: 'Процент', value: 'percent' },
            { label: 'Число', value: 'number' },
            { label: 'Завершено/Незавершено', value: 'boolean' },
            { label: 'Дата', value: 'date' },
            { label: 'Текст', value: 'text' },
          ],
        },
        {
          name: 'color',
          type: 'text',
          label: 'Цвет',
        },
        {
          name: 'icon',
          type: 'text',
          label: 'Иконка',
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
          label: 'URL API',
          required: true,
        },
        {
          name: 'method',
          type: 'select',
          label: 'Метод',
          defaultValue: 'GET',
          options: [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
          ],
        },
        {
          name: 'headers',
          type: 'array',
          label: 'Заголовки запроса',
          fields: [
            {
              name: 'key',
              type: 'text',
              label: 'Ключ',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              label: 'Значение',
              required: true,
            },
          ],
        },
        {
          name: 'responseMapping',
          type: 'array',
          label: 'Мапинг ответа',
          fields: [
            {
              name: 'field',
              type: 'text',
              label: 'Поле в ответе',
              required: true,
            },
            {
              name: 'label',
              type: 'text',
              label: 'Отображаемое название',
              required: true,
            },
            {
              name: 'type',
              type: 'select',
              label: 'Тип данных',
              defaultValue: 'percent',
              options: [
                { label: 'Процент', value: 'percent' },
                { label: 'Число', value: 'number' },
                { label: 'Дата', value: 'date' },
                { label: 'Текст', value: 'text' },
                { label: 'Булево', value: 'boolean' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'achievements',
      type: 'array',
      label: 'Достижения',
      admin: {
        condition: (data, siblingData) => siblingData?.displayType === 'achievements',
        description: 'Список достижений для отображения',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Название',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Описание',
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: 'Иконка',
        },
        {
          name: 'requiredValue',
          type: 'number',
          label: 'Требуемое значение',
          admin: {
            description: 'Значение, необходимое для получения достижения',
          },
        },
        {
          name: 'fieldToTrack',
          type: 'text',
          label: 'Отслеживаемое поле',
          admin: {
            description: 'Поле пользователя для отслеживания прогресса',
          },
        },
        {
          name: 'reward',
          type: 'text',
          label: 'Награда',
        },
        {
          name: 'isSecret',
          type: 'checkbox',
          label: 'Секретное достижение',
          defaultValue: false,
          admin: {
            description: 'Не показывать до разблокировки',
          },
        },
      ],
    },
    {
      name: 'chartSettings',
      type: 'group',
      label: 'Настройки графика',
      admin: {
        condition: (data, siblingData) => siblingData?.displayType === 'chart',
      },
      fields: [
        {
          name: 'chartType',
          type: 'select',
          label: 'Тип графика',
          defaultValue: 'line',
          options: [
            { label: 'Линейный', value: 'line' },
            { label: 'Столбчатый', value: 'bar' },
            { label: 'Круговой', value: 'pie' },
            { label: 'Радар', value: 'radar' },
          ],
        },
        {
          name: 'showLegend',
          type: 'checkbox',
          label: 'Показывать легенду',
          defaultValue: true,
        },
        {
          name: 'enableAnimation',
          type: 'checkbox',
          label: 'Включить анимацию',
          defaultValue: true,
        },
        {
          name: 'period',
          type: 'select',
          label: 'Период',
          defaultValue: 'week',
          options: [
            { label: 'День', value: 'day' },
            { label: 'Неделя', value: 'week' },
            { label: 'Месяц', value: 'month' },
            { label: 'Год', value: 'year' },
            { label: 'Все время', value: 'all' },
          ],
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Дополнительные настройки',
      fields: [
        {
          name: 'showTrends',
          type: 'checkbox',
          label: 'Показывать тренды',
          defaultValue: true,
        },
        {
          name: 'enableComparison',
          type: 'checkbox',
          label: 'Включить сравнение с другими пользователями',
          defaultValue: false,
        },
        {
          name: 'refreshInterval',
          type: 'number',
          label: 'Интервал обновления (сек)',
          defaultValue: 60,
        },
        {
          name: 'showTips',
          type: 'checkbox',
          label: 'Показывать советы',
          defaultValue: true,
        },
        {
          name: 'customCSS',
          type: 'textarea',
          label: 'Пользовательский CSS',
          admin: {
            description: 'Дополнительные стили для блока',
          },
        },
      ],
    },
  ],
}

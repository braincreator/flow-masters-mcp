import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Poll: Block = {
  slug: 'poll',
  interfaceName: 'PollBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока опроса/голосования',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Подзаголовок или вопрос',
      },
    },
    {
      name: 'question',
      type: 'richText',
      label: 'Вопрос опроса',
      editor: lexicalEditor({}),
      required: true,
    },
    {
      name: 'pollType',
      type: 'select',
      label: 'Тип опроса',
      defaultValue: 'singleChoice',
      options: [
        { label: 'Один вариант ответа', value: 'singleChoice' },
        { label: 'Несколько вариантов ответа', value: 'multipleChoice' },
        { label: 'Открытый ответ', value: 'openEnded' },
        { label: 'Рейтинг (шкала)', value: 'ratingScale' },
      ],
    },
    {
      name: 'options',
      type: 'array',
      label: 'Варианты ответа',
      minRows: 2,
      admin: {
        condition: (data, siblingData) =>
          siblingData?.pollType === 'singleChoice' ||
          siblingData?.pollType === 'multipleChoice' ||
          siblingData?.pollType === 'ratingScale',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Текст варианта',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          label: 'Значение варианта',
          required: true,
          admin: {
            description: 'Уникальное значение для идентификации варианта',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Изображение (опционально)',
        },
        {
          name: 'voteCount',
          type: 'number',
          label: 'Количество голосов',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'ratingScaleSettings',
      type: 'group',
      label: 'Настройки шкалы рейтинга',
      admin: {
        condition: (data, siblingData) => siblingData?.pollType === 'ratingScale',
      },
      fields: [
        {
          name: 'minLabel',
          type: 'text',
          label: 'Метка минимального значения',
          defaultValue: 'Совсем не согласен',
        },
        {
          name: 'maxLabel',
          type: 'text',
          label: 'Метка максимального значения',
          defaultValue: 'Полностью согласен',
        },
        {
          name: 'steps',
          type: 'number',
          label: 'Количество шагов',
          defaultValue: 5,
          min: 2,
          max: 10,
        },
      ],
    },
    {
      name: 'submissionTarget',
      type: 'select',
      label: 'Куда сохранять результаты',
      defaultValue: 'collection',
      options: [
        { label: 'В коллекцию Payload', value: 'collection' },
        { label: 'Внешний API', value: 'api' },
        { label: 'Не сохранять (только отображение)', value: 'none' },
      ],
    },
    {
      name: 'submissionCollection',
      type: 'text',
      label: 'Submission Collection Slug',
      required: true,
      admin: {
        condition: (_, { submitAction }) => submitAction === 'saveToCollection',
        description: 'Введите слаг коллекции, в которую будут сохраняться голоса.',
      },
    },
    {
      name: 'targetCollection',
      label: 'Result Display Collection Slug',
      type: 'text',
      required: true,
      admin: {
        condition: (_, { submitAction }) => submitAction === 'saveToCollection',
        description:
          '(Опционально) Введите слаг коллекции для отображения агрегированных результатов.',
      },
    },
    {
      name: 'collectionSettings',
      type: 'group',
      label: 'Настройки коллекции',
      admin: {
        condition: (data, siblingData) => siblingData?.submissionTarget === 'collection',
      },
      fields: [
        {
          name: 'associateWithUser',
          type: 'checkbox',
          label: 'Связать с текущим пользователем',
          defaultValue: true,
        },
        {
          name: 'trackIndividualVotes',
          type: 'checkbox',
          label: 'Отслеживать индивидуальные голоса',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'apiSettings',
      type: 'group',
      label: 'Настройки API',
      admin: {
        condition: (data, siblingData) => siblingData?.submissionTarget === 'api',
      },
      fields: [
        {
          name: 'submitUrl',
          type: 'text',
          label: 'URL для отправки голоса',
          required: true,
        },
        {
          name: 'resultsUrl',
          type: 'text',
          label: 'URL для получения результатов',
        },
        {
          name: 'method',
          type: 'select',
          label: 'HTTP метод',
          defaultValue: 'POST',
          options: [
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
          ],
        },
        {
          name: 'headers',
          type: 'array',
          label: 'Заголовки',
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
      ],
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Настройки отображения',
      fields: [
        {
          name: 'showResults',
          type: 'select',
          label: 'Когда показывать результаты',
          defaultValue: 'afterVoting',
          options: [
            { label: 'После голосования', value: 'afterVoting' },
            { label: 'Всегда', value: 'always' },
            { label: 'Никогда', value: 'never' },
            { label: 'По окончании', value: 'onEndDate' },
          ],
        },
        {
          name: 'resultsDisplayType',
          type: 'select',
          label: 'Тип отображения результатов',
          defaultValue: 'percentage',
          options: [
            { label: 'Проценты', value: 'percentage' },
            { label: 'Количество голосов', value: 'count' },
            { label: 'Прогресс-бар', value: 'progressBar' },
          ],
        },
        {
          name: 'allowMultipleVotes',
          type: 'checkbox',
          label: 'Разрешить голосовать несколько раз',
          defaultValue: false,
          admin: {
            description: 'Обычно требует авторизации пользователя',
          },
        },
        {
          name: 'requireLogin',
          type: 'checkbox',
          label: 'Требовать авторизацию для голосования',
          defaultValue: true,
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'Дата окончания голосования',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
            description: 'Опрос будет закрыт после этой даты',
          },
        },
        {
          name: 'closedMessage',
          type: 'richText',
          label: 'Сообщение после закрытия опроса',
          editor: lexicalEditor({}),
          defaultValue: [
            {
              children: [
                {
                  text: 'Голосование завершено.',
                },
              ],
            },
          ],
        },
        {
          name: 'customCSS',
          type: 'textarea',
          label: 'Пользовательский CSS',
          admin: {
            description: 'Дополнительные стили для блока опроса',
          },
        },
      ],
    },
  ],
}

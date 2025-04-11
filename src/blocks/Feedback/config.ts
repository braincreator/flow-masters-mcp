import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Feedback: Block = {
  slug: 'feedback',
  interfaceName: 'FeedbackBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока обратной связи',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Подзаголовок или призыв к действию',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Описание назначения формы обратной связи',
      },
    },
    {
      name: 'formFields',
      type: 'array',
      label: 'Поля формы',
      minRows: 1,
      fields: [
        {
          name: 'fieldName',
          type: 'text',
          label: 'Имя поля (уникальное)',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          label: 'Лейбл поля',
          required: true,
        },
        {
          name: 'fieldType',
          type: 'select',
          label: 'Тип поля',
          required: true,
          options: [
            { label: 'Текстовое поле', value: 'text' },
            { label: 'Текстовая область', value: 'textarea' },
            { label: 'Email', value: 'email' },
            { label: 'Число', value: 'number' },
            { label: 'Выбор (Select)', value: 'select' },
            { label: 'Радио кнопки', value: 'radio' },
            { label: 'Чекбокс', value: 'checkbox' },
            { label: 'Рейтинг (звезды)', value: 'rating' },
            { label: 'Скрытое поле', value: 'hidden' },
          ],
        },
        {
          name: 'options',
          type: 'array',
          label: 'Опции (для Select, Radio)',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.fieldType === 'select' || siblingData?.fieldType === 'radio',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Лейбл опции',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              label: 'Значение опции',
              required: true,
            },
          ],
        },
        {
          name: 'placeholder',
          type: 'text',
          label: 'Placeholder',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.fieldType === 'text' ||
              siblingData?.fieldType === 'textarea' ||
              siblingData?.fieldType === 'email' ||
              siblingData?.fieldType === 'number',
          },
        },
        {
          name: 'defaultValue',
          type: 'text',
          label: 'Значение по умолчанию',
        },
        {
          name: 'required',
          type: 'checkbox',
          label: 'Обязательное поле',
          defaultValue: false,
        },
        {
          name: 'maxLength',
          type: 'number',
          label: 'Макс. длина (для текста)',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.fieldType === 'text' || siblingData?.fieldType === 'textarea',
          },
        },
        {
          name: 'min',
          type: 'number',
          label: 'Мин. значение (для числа, рейтинга)',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.fieldType === 'number' || siblingData?.fieldType === 'rating',
          },
        },
        {
          name: 'max',
          type: 'number',
          label: 'Макс. значение (для числа, рейтинга)',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.fieldType === 'number' || siblingData?.fieldType === 'rating',
          },
          defaultValue: 5, // Для рейтинга
        },
        {
          name: 'step',
          type: 'number',
          label: 'Шаг (для числа, рейтинга)',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.fieldType === 'number' || siblingData?.fieldType === 'rating',
            step: 0.1,
          },
          defaultValue: 1, // Для рейтинга
        },
      ],
    },
    {
      name: 'submitButtonLabel',
      type: 'text',
      label: 'Текст кнопки отправки',
      defaultValue: 'Отправить отзыв',
    },
    {
      name: 'submissionTarget',
      type: 'select',
      label: 'Куда отправлять данные',
      defaultValue: 'collection',
      options: [
        { label: 'В коллекцию Payload', value: 'collection' },
        { label: 'На Email', value: 'email' },
        { label: 'Внешний API', value: 'api' },
        { label: 'Не сохранять', value: 'none' }, // Для отображения
      ],
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
          name: 'collection',
          type: 'text',
          label: 'Название коллекции',
          required: true,
          defaultValue: 'feedbackSubmissions',
          admin: {
            description: 'Коллекция для сохранения отзывов',
          },
        },
        {
          name: 'mapFields',
          type: 'array',
          label: 'Маппинг полей формы на поля коллекции',
          fields: [
            {
              name: 'formField',
              type: 'text',
              label: 'Имя поля формы',
              required: true,
            },
            {
              name: 'collectionField',
              type: 'text',
              label: 'Имя поля коллекции',
              required: true,
            },
          ],
        },
        {
          name: 'associateWithUser',
          type: 'checkbox',
          label: 'Связать с текущим пользователем',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'emailSettings',
      type: 'group',
      label: 'Настройки Email',
      admin: {
        condition: (data, siblingData) => siblingData?.submissionTarget === 'email',
      },
      fields: [
        {
          name: 'recipientEmail',
          type: 'email',
          label: 'Email получателя',
          required: true,
        },
        {
          name: 'subject',
          type: 'text',
          label: 'Тема письма',
          defaultValue: 'Новый отзыв с сайта',
        },
        {
          name: 'sendConfirmation',
          type: 'checkbox',
          label: 'Отправить подтверждение пользователю',
          defaultValue: true,
        },
        {
          name: 'confirmationSubject',
          type: 'text',
          label: 'Тема письма подтверждения',
          defaultValue: 'Спасибо за ваш отзыв!',
          admin: {
            condition: (data, siblingData) => siblingData?.sendConfirmation === true,
          },
        },
        {
          name: 'confirmationMessage',
          type: 'textarea',
          label: 'Текст письма подтверждения',
          defaultValue: 'Мы получили ваш отзыв и скоро его рассмотрим.',
          admin: {
            condition: (data, siblingData) => siblingData?.sendConfirmation === true,
          },
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
          name: 'apiUrl',
          type: 'text',
          label: 'URL API',
          required: true,
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
        {
          name: 'responseMessage',
          type: 'text',
          label: 'Сообщение об успехе из ответа API',
          admin: {
            description: 'Путь к полю с сообщением в ответе (напр. data.message)',
          },
        },
      ],
    },
    {
      name: 'successMessage',
      type: 'richText',
      label: 'Сообщение об успешной отправке',
      editor: lexicalEditor({}),
      defaultValue: [
        {
          children: [
            {
              text: 'Спасибо! Ваш отзыв успешно отправлен.',
            },
          ],
        },
      ],
    },
    {
      name: 'errorMessage',
      type: 'richText',
      label: 'Сообщение об ошибке отправки',
      editor: lexicalEditor({}),
      defaultValue: [
        {
          children: [
            {
              text: 'Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.',
            },
          ],
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Настройки отображения формы',
      fields: [
        {
          name: 'layout',
          type: 'select',
          label: 'Расположение полей',
          defaultValue: 'vertical',
          options: [
            { label: 'Вертикальное', value: 'vertical' },
            { label: 'Горизонтальное', value: 'horizontal' },
            { label: 'В линию', value: 'inline' },
          ],
        },
        {
          name: 'showLabels',
          type: 'checkbox',
          label: 'Показывать лейблы полей',
          defaultValue: true,
        },
        {
          name: 'usePlaceholdersAsLabels',
          type: 'checkbox',
          label: 'Использовать placeholder вместо лейблов',
          defaultValue: false,
          admin: {
            condition: (data, siblingData) => !siblingData?.showLabels,
          },
        },
        {
          name: 'enableRecaptcha',
          type: 'checkbox',
          label: 'Включить reCAPTCHA',
          defaultValue: false,
        },
        {
          name: 'recaptchaSiteKey',
          type: 'text',
          label: 'Ключ сайта reCAPTCHA',
          admin: {
            condition: (data, siblingData) => siblingData?.enableRecaptcha,
          },
        },
      ],
    },
  ],
}

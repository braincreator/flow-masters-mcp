import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const LeadMagnetOffer: Block = {
  slug: 'leadMagnetOffer',
  interfaceName: 'LeadMagnetOfferBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок предложения',
      required: true,
      admin: {
        description: 'Например: "Получите бесплатный гайд по ChatGPT"',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок (опционально)',
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание лид-магнита',
      editor: lexicalEditor({}),
      required: true,
      admin: {
        description: 'Что получит пользователь?',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Изображение (обложка гайда, видео и т.д.)',
    },
    {
      name: 'formFields',
      type: 'array',
      label: 'Поля формы для сбора данных',
      minRows: 1,
      defaultValue: [
        { fieldName: 'email', label: 'Ваш Email', fieldType: 'email', required: true },
      ],
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
            { label: 'Email', value: 'email' },
            { label: 'Телефон', value: 'tel' },
            { label: 'Число', value: 'number' },
            { label: 'Скрытое поле', value: 'hidden' }, // Для передачи доп. данных
            { label: 'Чекбокс (согласие)', value: 'checkbox' },
          ],
        },
        {
          name: 'placeholder',
          type: 'text',
          label: 'Placeholder',
        },
        {
          name: 'required',
          type: 'checkbox',
          label: 'Обязательное поле',
          defaultValue: false,
        },
        {
          name: 'consentText',
          type: 'richText',
          label: 'Текст согласия (для чекбокса)',
          editor: lexicalEditor({}),
          admin: {
            condition: (data, siblingData) => siblingData?.fieldType === 'checkbox',
          },
        },
      ],
    },
    {
      name: 'submitButtonLabel',
      type: 'text',
      label: 'Текст кнопки отправки',
      required: true,
      defaultValue: 'Получить бесплатно',
    },
    {
      name: 'submissionTarget',
      type: 'select',
      label: 'Куда отправлять данные',
      defaultValue: 'collection',
      options: [
        { label: 'В коллекцию Payload', value: 'collection' },
        { label: 'На Email', value: 'email' },
        { label: 'Внешний API (CRM, сервис рассылок)', value: 'api' },
      ],
    },
    {
      name: 'submissionSettings',
      type: 'group',
      label: 'Submission Settings',
      fields: [
        {
          name: 'targetCollection',
          type: 'text',
          label: 'Submission Collection Slug',
          required: true,
          admin: {
            description:
              "Введите слаг коллекции, в которую будут сохраняться данные формы (например, 'leads').",
          },
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
          label: 'Email получателя уведомления',
          required: true,
        },
        {
          name: 'subject',
          type: 'text',
          label: 'Тема письма уведомления',
          defaultValue: 'Новый лид с сайта!',
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
        // ... Доп. настройки API: метод, заголовки, маппинг
      ],
    },
    {
      name: 'successAction',
      type: 'select',
      label: 'Действие после успешной отправки',
      defaultValue: 'message',
      options: [
        { label: 'Показать сообщение', value: 'message' },
        { label: 'Перенаправить на URL', value: 'redirect' },
        { label: 'Запустить скачивание файла', value: 'download' },
      ],
    },
    {
      name: 'successMessage',
      type: 'richText',
      label: 'Сообщение об успехе',
      editor: lexicalEditor({}),
      defaultValue: [
        {
          children: [
            {
              text: 'Спасибо! Проверьте ваш Email, мы отправили вам материал.',
            },
          ],
        },
      ],
      admin: {
        condition: (data, siblingData) => siblingData?.successAction === 'message',
      },
    },
    {
      name: 'redirectUrl',
      type: 'text',
      label: 'URL для перенаправления',
      admin: {
        condition: (data, siblingData) => siblingData?.successAction === 'redirect',
      },
    },
    {
      name: 'downloadFile',
      type: 'upload',
      relationTo: 'media',
      label: 'Файл для скачивания',
      admin: {
        condition: (data, siblingData) => siblingData?.successAction === 'download',
      },
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Макет блока',
      defaultValue: 'imageLeft',
      options: [
        { label: 'Изображение слева, форма справа', value: 'imageLeft' },
        { label: 'Изображение справа, форма слева', value: 'imageRight' },
        { label: 'Изображение сверху, форма снизу', value: 'imageTop' },
        { label: 'Только форма', value: 'formOnly' },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'text',
      label: 'Цвет фона блока (HEX, rgba)',
    },
  ],
}

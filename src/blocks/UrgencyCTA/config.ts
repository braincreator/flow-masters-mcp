import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const UrgencyCTA: Block = {
  slug: 'urgencyCTA',
  interfaceName: 'UrgencyCTABlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок',
      required: true,
      admin: {
        description: 'Основной призыв, например: "Последний шанс записаться со скидкой!"',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок (опционально)',
      admin: {
        description: 'Дополнительное пояснение или усиление призыва.',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание (опционально)',
      editor: lexicalEditor({}),
    },
    {
      name: 'urgencyElement',
      type: 'select',
      label: 'Элемент срочности',
      defaultValue: 'none',
      options: [
        { label: 'Нет', value: 'none' },
        { label: 'Таймер обратного отсчета', value: 'countdown' },
        { label: 'Ограниченное количество мест/товара', value: 'limitedSpots' },
        { label: 'Дата окончания предложения', value: 'endDate' },
      ],
    },
    {
      name: 'countdownEndDate',
      type: 'date',
      label: 'Дата и время окончания для таймера',
      required: true,
      admin: {
        condition: (data, siblingData) => siblingData?.urgencyElement === 'countdown',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd.MM.yyyy HH:mm',
        },
      },
    },
    {
      name: 'limitedSpotsText',
      type: 'text',
      label: 'Текст для ограниченного количества',
      defaultValue: 'Осталось {count} мест!',
      admin: {
        condition: (data, siblingData) => siblingData?.urgencyElement === 'limitedSpots',
        description:
          'Используйте {count} для подстановки реального числа (потребует логики на фронтенде)',
      },
    },
    {
      name: 'initialSpotsCount',
      type: 'number',
      label: 'Начальное количество мест (для отображения)',
      admin: {
        condition: (data, siblingData) => siblingData?.urgencyElement === 'limitedSpots',
      },
    },
    {
      name: 'endDateText',
      type: 'text',
      label: 'Текст для даты окончания',
      defaultValue: 'Предложение действует до {date}',
      admin: {
        condition: (data, siblingData) => siblingData?.urgencyElement === 'endDate',
        description: 'Используйте {date} для подстановки даты',
      },
    },
    {
      name: 'offerEndDate',
      type: 'date',
      label: 'Дата окончания предложения',
      required: true,
      admin: {
        condition: (data, siblingData) => siblingData?.urgencyElement === 'endDate',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd.MM.yyyy',
        },
      },
    },
    {
      name: 'ctaButton',
      type: 'group',
      label: 'Кнопка призыва к действию',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Текст кнопки',
          required: true,
          defaultValue: 'Получить предложение',
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL ссылки',
          required: true,
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          label: 'Открывать в новой вкладке',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'secondaryButton',
      type: 'group',
      label: 'Вторичная кнопка (опционально)',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Текст кнопки',
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL ссылки',
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Макет блока',
      defaultValue: 'centerAligned',
      options: [
        { label: 'Выравнивание по центру', value: 'centerAligned' },
        { label: 'Текст слева, кнопка справа', value: 'leftTextButtonRight' },
        { label: 'Колонки', value: 'columns' },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'text',
      label: 'Цвет фона блока (HEX, rgba)',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Фоновое изображение (опционально)',
    },
    {
      name: 'textColor',
      type: 'text',
      label: 'Цвет текста (HEX, rgba)',
    },
  ],
}

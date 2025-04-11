import type { Block } from 'payload'

export const ReportEmbed: Block = {
  slug: 'reportEmbed',
  interfaceName: 'ReportEmbedBlock',
  labels: {
    singular: 'Встраиваемый отчет',
    plural: 'Встраиваемые отчеты',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Заголовок блока (опционально)',
      admin: {
        description: 'Например: "Статистика регистраций", "Отчет по продажам"',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Краткое описание отчета (опционально)',
    },
    {
      name: 'embedType',
      type: 'select',
      label: 'Тип встраивания',
      defaultValue: 'iframe',
      options: [
        { label: 'Iframe URL', value: 'iframe' },
        { label: 'HTML код', value: 'htmlCode' },
      ],
      admin: {
        description: 'Выберите способ встраивания отчета.',
      },
    },
    {
      name: 'iframeUrl',
      type: 'url',
      label: 'URL отчета для Iframe',
      required: true,
      admin: {
        condition: (data, siblingData) => siblingData?.embedType === 'iframe',
        description: 'URL страницы с отчетом (например, из Google Data Studio, Tableau Public).',
      },
    },
    {
      name: 'htmlCode',
      type: 'textarea',
      label: 'HTML код для встраивания',
      required: true,
      admin: {
        condition: (data, siblingData) => siblingData?.embedType === 'htmlCode',
        description: 'Вставьте полный HTML код, предоставленный сервисом аналитики.',
      },
    },
    {
      name: 'height',
      type: 'number',
      label: 'Высота блока (пиксели)',
      defaultValue: 600,
      admin: {
        description: 'Задайте высоту для iframe или контейнера.',
      },
    },
    {
      name: 'enableScrolling',
      type: 'checkbox',
      label: 'Разрешить прокрутку внутри iframe',
      defaultValue: true,
      admin: {
        condition: (data, siblingData) => siblingData?.embedType === 'iframe',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Примечания (для администратора)',
    },
  ],
}

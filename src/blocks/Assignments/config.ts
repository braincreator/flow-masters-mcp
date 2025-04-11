import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Assignments: Block = {
  slug: 'assignments',
  interfaceName: 'AssignmentsBlock',
  labels: {
    singular: 'Задание',
    plural: 'Задания',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название задания',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание/Инструкция',
      editor: lexicalEditor({}),
      required: true,
    },
    {
      name: 'relatedCourseOrModule',
      type: 'relationship',
      relationTo: ['courses', 'modules'], // Связь с курсами или модулями
      label: 'Связать с курсом/модулем',
      admin: {
        description: 'Укажите, к какому курсу или модулю относится это задание.',
      },
      required: true,
    },
    {
      name: 'dueDate',
      type: 'date',
      label: 'Срок сдачи',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeIntervals: 15,
        },
      },
    },
    {
      name: 'submissionType',
      type: 'select',
      label: 'Тип сдачи',
      required: true,
      defaultValue: 'fileUpload',
      options: [
        { label: 'Загрузка файла(ов)', value: 'fileUpload' },
        { label: 'Ввод текста', value: 'textInput' },
        { label: 'Отправка ссылки', value: 'urlSubmission' },
        // { label: 'Комбинированный (файл + текст)', value: 'combined' }, // Возможное усложнение
      ],
    },
    {
      name: 'allowedFileTypes',
      type: 'text',
      label: 'Разрешенные типы файлов (через запятую, напр. pdf,docx,zip)',
      admin: {
        condition: (data, siblingData) => siblingData.submissionType === 'fileUpload',
      },
    },
    {
      name: 'maxFileSizeMB',
      type: 'number',
      label: 'Макс. размер файла (MB)',
      defaultValue: 10,
      min: 1,
      admin: {
        condition: (data, siblingData) => siblingData.submissionType === 'fileUpload',
      },
    },
    {
      name: 'maxFileCount',
      type: 'number',
      label: 'Макс. количество файлов',
      defaultValue: 1,
      min: 1,
      admin: {
        condition: (data, siblingData) => siblingData.submissionType === 'fileUpload',
      },
    },
    {
      name: 'attachedMaterials',
      type: 'array',
      label: 'Прикрепленные материалы к заданию',
      fields: [
        {
          name: 'materialFile',
          type: 'upload',
          relationTo: 'media', // Используем общую коллекцию media
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          label: 'Описание файла (опционально)',
        },
      ],
    },
    {
      name: 'gradingCriteria',
      type: 'richText',
      label: 'Критерии оценки (опционально)',
      editor: lexicalEditor({}),
    },
    {
      name: 'pointsPossible',
      type: 'number',
      label: 'Максимальное количество баллов (опционально)',
      min: 0,
    },
    // Примечание: Этот блок описывает само задание.
    // Логика отправки, хранения и оценки решений (submissions)
    // должна быть реализована отдельно, вероятно, с использованием
    // новой коллекции 'submissions' и связью с пользователями и этим блоком/заданием.
  ],
}

import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Course: Block = {
  slug: 'course',
  interfaceName: 'CourseBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название курса',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Краткое описание курса или слоган',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание курса',
      editor: lexicalEditor({}),
      admin: {
        description: 'Полное описание курса',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Обложка курса',
      admin: {
        description: 'Главное изображение курса',
      },
    },
    {
      name: 'level',
      type: 'select',
      label: 'Уровень сложности',
      options: [
        { label: 'Начинающий', value: 'beginner' },
        { label: 'Средний', value: 'intermediate' },
        { label: 'Продвинутый', value: 'advanced' },
        { label: 'Все уровни', value: 'all-levels' },
      ],
    },
    {
      name: 'duration',
      type: 'group',
      label: 'Продолжительность',
      fields: [
        {
          name: 'value',
          type: 'number',
          label: 'Значение',
          required: true,
        },
        {
          name: 'unit',
          type: 'select',
          label: 'Единица измерения',
          required: true,
          options: [
            { label: 'Часов', value: 'hours' },
            { label: 'Дней', value: 'days' },
            { label: 'Недель', value: 'weeks' },
            { label: 'Месяцев', value: 'months' },
          ],
        },
      ],
    },
    {
      name: 'format',
      type: 'select',
      label: 'Формат обучения',
      options: [
        { label: 'Онлайн', value: 'online' },
        { label: 'Офлайн', value: 'offline' },
        { label: 'Смешанный', value: 'blended' },
        { label: 'Самостоятельное изучение', value: 'self-paced' },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Дата начала',
      admin: {
        description: 'Дата начала ближайшего потока (если применимо)',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'enrollmentStatus',
      type: 'select',
      label: 'Статус набора',
      options: [
        { label: 'Открыт набор', value: 'open' },
        { label: 'Скоро открытие', value: 'coming-soon' },
        { label: 'Набор закрыт', value: 'closed' },
        { label: 'Набор по запросу', value: 'on-demand' },
      ],
    },
    {
      name: 'pricing',
      type: 'group',
      label: 'Стоимость',
      fields: [
        {
          name: 'price',
          type: 'number',
          label: 'Основная стоимость',
        },
        {
          name: 'currency',
          type: 'select',
          label: 'Валюта',
          defaultValue: 'RUB',
          options: [
            { label: 'Рубли (₽)', value: 'RUB' },
            { label: 'Доллары ($)', value: 'USD' },
            { label: 'Евро (€)', value: 'EUR' },
          ],
        },
        {
          name: 'discountPrice',
          type: 'number',
          label: 'Цена со скидкой',
          admin: {
            description: 'Оставьте пустым, если скидки нет',
          },
        },
        {
          name: 'installmentAvailable',
          type: 'checkbox',
          label: 'Возможна рассрочка',
          defaultValue: false,
        },
        {
          name: 'installmentDetails',
          type: 'textarea',
          label: 'Детали рассрочки',
          admin: {
            condition: (data, siblingData) => siblingData.installmentAvailable,
          },
        },
      ],
    },
    {
      name: 'learningOutcomes',
      type: 'array',
      label: 'Результаты обучения',
      admin: {
        description: 'Чему научатся студенты',
      },
      fields: [
        {
          name: 'outcome',
          type: 'text',
          label: 'Результат обучения',
          required: true,
        },
      ],
    },
    {
      name: 'requirements',
      type: 'array',
      label: 'Требования к участникам',
      admin: {
        description: 'Что должны знать или иметь студенты',
      },
      fields: [
        {
          name: 'requirement',
          type: 'text',
          label: 'Требование',
          required: true,
        },
      ],
    },
    {
      name: 'targetAudience',
      type: 'array',
      label: 'Целевая аудитория',
      admin: {
        description: 'Для кого предназначен этот курс',
      },
      fields: [
        {
          name: 'audience',
          type: 'text',
          label: 'Аудитория',
          required: true,
        },
      ],
    },
    {
      name: 'curriculum',
      type: 'array',
      label: 'Программа курса',
      admin: {
        description: 'Разделы и уроки курса',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Название модуля',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Описание модуля',
        },
        {
          name: 'lessons',
          type: 'array',
          label: 'Уроки',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Название урока',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Описание урока',
            },
            {
              name: 'duration',
              type: 'text',
              label: 'Продолжительность',
              admin: {
                description: 'Например: "45 минут", "2 часа"',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'instructors',
      type: 'array',
      label: 'Преподаватели',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Имя преподавателя',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          label: 'Должность или роль',
        },
        {
          name: 'bio',
          type: 'textarea',
          label: 'Краткая биография',
        },
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          label: 'Фотография',
        },
      ],
    },
    {
      name: 'testimonials',
      type: 'array',
      label: 'Отзывы студентов',
      fields: [
        {
          name: 'text',
          type: 'textarea',
          label: 'Текст отзыва',
          required: true,
        },
        {
          name: 'studentName',
          type: 'text',
          label: 'Имя студента',
          required: true,
        },
        {
          name: 'studentTitle',
          type: 'text',
          label: 'Должность/компания студента',
        },
        {
          name: 'studentImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Фото студента',
        },
        {
          name: 'rating',
          type: 'number',
          label: 'Оценка (1-5)',
          min: 1,
          max: 5,
        },
      ],
    },
    {
      name: 'faq',
      type: 'array',
      label: 'Часто задаваемые вопросы',
      fields: [
        {
          name: 'question',
          type: 'text',
          label: 'Вопрос',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          label: 'Ответ',
          required: true,
        },
      ],
    },
    {
      name: 'certificates',
      type: 'group',
      label: 'Сертификация',
      fields: [
        {
          name: 'issueCertificate',
          type: 'checkbox',
          label: 'Выдается сертификат',
          defaultValue: true,
        },
        {
          name: 'certificateDescription',
          type: 'textarea',
          label: 'Описание сертификата',
          admin: {
            condition: (data, siblingData) => siblingData.issueCertificate,
          },
        },
        {
          name: 'certificateImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Изображение сертификата',
          admin: {
            condition: (data, siblingData) => siblingData.issueCertificate,
          },
        },
      ],
    },
    {
      name: 'enrollmentCTA',
      type: 'group',
      label: 'Призыв к действию (запись)',
      fields: [
        {
          name: 'buttonText',
          type: 'text',
          label: 'Текст кнопки',
          defaultValue: 'Записаться на курс',
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL формы записи',
        },
        {
          name: 'additionalText',
          type: 'textarea',
          label: 'Дополнительный текст',
          admin: {
            description: 'Например: "Осталось всего 5 мест"',
          },
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Настройки отображения',
      fields: [
        {
          name: 'backgroundColor',
          type: 'select',
          label: 'Цвет фона',
          defaultValue: 'transparent',
          options: [
            { label: 'Прозрачный', value: 'transparent' },
            { label: 'Светлый', value: 'light' },
            { label: 'Темный', value: 'dark' },
            { label: 'Акцентный', value: 'accent' },
          ],
        },
        {
          name: 'paddingTop',
          type: 'select',
          label: 'Отступ сверху',
          defaultValue: 'medium',
          options: [
            { label: 'Нет', value: 'none' },
            { label: 'Маленький', value: 'small' },
            { label: 'Средний', value: 'medium' },
            { label: 'Большой', value: 'large' },
          ],
        },
        {
          name: 'paddingBottom',
          type: 'select',
          label: 'Отступ снизу',
          defaultValue: 'medium',
          options: [
            { label: 'Нет', value: 'none' },
            { label: 'Маленький', value: 'small' },
            { label: 'Средний', value: 'medium' },
            { label: 'Большой', value: 'large' },
          ],
        },
        {
          name: 'containerWidth',
          type: 'select',
          label: 'Ширина контейнера',
          defaultValue: 'default',
          options: [
            { label: 'По умолчанию', value: 'default' },
            { label: 'Узкий', value: 'narrow' },
            { label: 'Широкий', value: 'wide' },
            { label: 'Полный', value: 'full' },
          ],
        },
      ],
    },
  ],
  labels: {
    singular: 'Блок курса',
    plural: 'Блоки курсов',
  },
}

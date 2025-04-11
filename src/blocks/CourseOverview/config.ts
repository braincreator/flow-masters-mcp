import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const CourseOverview: Block = {
  slug: 'courseOverview',
  interfaceName: 'CourseOverviewBlock',
  fields: [
    {
      name: 'courseSource',
      type: 'select',
      label: 'Источник данных курса',
      defaultValue: 'relation',
      options: [
        { label: 'Связь с коллекцией Курсы', value: 'relation' },
        { label: 'Ручное заполнение', value: 'manual' },
      ],
    },
    {
      name: 'courseRelation',
      type: 'relationship',
      label: 'Выберите курс',
      relationTo: 'courses', // Убедитесь, что у вас есть коллекция 'courses'
      hasMany: false,
      required: true,
      admin: {
        condition: (data, siblingData) => siblingData?.courseSource === 'relation',
        description: 'Данные будут автоматически подтянуты из выбранного курса.',
      },
    },
    {
      name: 'manualData',
      type: 'group',
      label: 'Данные курса (ручное заполнение)',
      admin: {
        condition: (data, siblingData) => siblingData?.courseSource === 'manual',
      },
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
          label: 'Подзаголовок курса',
        },
        {
          name: 'shortDescription',
          type: 'textarea',
          label: 'Краткое описание',
          required: true,
        },
        {
          name: 'targetAudience',
          type: 'textarea',
          label: 'Для кого этот курс?',
        },
        {
          name: 'duration',
          type: 'text',
          label: 'Длительность',
          admin: {
            description: 'Например: 10 часов, 5 недель',
          },
        },
        {
          name: 'level',
          type: 'select',
          label: 'Уровень сложности',
          options: [
            { label: 'Начальный', value: 'beginner' },
            { label: 'Средний', value: 'intermediate' },
            { label: 'Продвинутый', value: 'advanced' },
            { label: 'Эксперт', value: 'expert' },
          ],
        },
        {
          name: 'keyTopics',
          type: 'array',
          label: 'Ключевые темы',
          fields: [
            {
              name: 'topic',
              type: 'text',
              label: 'Тема',
              required: true,
            },
            {
              name: 'icon',
              type: 'text',
              label: 'Иконка (опционально)',
            },
          ],
        },
        {
          name: 'instructor',
          type: 'group',
          label: 'Преподаватель/Автор',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Имя',
            },
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              label: 'Фото',
            },
            {
              name: 'title',
              type: 'text',
              label: 'Должность/Регалия',
            },
          ],
        },
        {
          name: 'mainImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Основное изображение/видео превью',
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
              defaultValue: 'Записаться на курс',
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
      ],
    },
    {
      name: 'displaySettings',
      type: 'group',
      label: 'Настройки отображения',
      fields: [
        {
          name: 'layout',
          type: 'select',
          label: 'Макет блока',
          defaultValue: 'imageRight',
          options: [
            { label: 'Изображение справа', value: 'imageRight' },
            { label: 'Изображение слева', value: 'imageLeft' },
            { label: 'Изображение сверху', value: 'imageTop' },
            { label: 'Текст поверх изображения (фон)', value: 'textOverImage' },
          ],
        },
        {
          name: 'showSubtitle',
          type: 'checkbox',
          label: 'Показывать подзаголовок',
          defaultValue: true,
        },
        {
          name: 'showAudience',
          type: 'checkbox',
          label: 'Показывать целевую аудиторию',
          defaultValue: true,
        },
        {
          name: 'showDuration',
          type: 'checkbox',
          label: 'Показывать длительность',
          defaultValue: true,
        },
        {
          name: 'showLevel',
          type: 'checkbox',
          label: 'Показывать уровень сложности',
          defaultValue: true,
        },
        {
          name: 'showInstructor',
          type: 'checkbox',
          label: 'Показывать преподавателя',
          defaultValue: true,
        },
        {
          name: 'showKeyTopics',
          type: 'checkbox',
          label: 'Показывать ключевые темы',
          defaultValue: true,
        },
        {
          name: 'backgroundColor',
          type: 'text',
          label: 'Цвет фона (HEX, rgba)',
        },
        {
          name: 'textColor',
          type: 'text',
          label: 'Цвет текста (HEX, rgba)',
        },
      ],
    },
  ],
}

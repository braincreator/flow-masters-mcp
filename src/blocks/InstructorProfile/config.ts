import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const InstructorProfile: Block = {
  slug: 'instructorProfile',
  interfaceName: 'InstructorProfileBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      defaultValue: 'О преподавателе',
    },
    {
      name: 'instructorSource',
      type: 'select',
      label: 'Источник данных',
      defaultValue: 'relation',
      options: [
        { label: 'Связь с коллекцией (например, users или instructors)', value: 'relation' },
        { label: 'Ручное заполнение', value: 'manual' },
      ],
    },
    {
      name: 'instructorRelation',
      type: 'relationship',
      label: 'Выберите преподавателя/автора',
      relationTo: 'users', // Или ваша коллекция преподавателей
      hasMany: false,
      required: true,
      admin: {
        condition: (data, siblingData) => siblingData?.instructorSource === 'relation',
        description: 'Данные будут автоматически подтянуты из выбранного профиля.',
      },
    },
    {
      name: 'manualData',
      type: 'group',
      label: 'Данные преподавателя (ручное заполнение)',
      admin: {
        condition: (data, siblingData) => siblingData?.instructorSource === 'manual',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Имя',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          label: 'Должность/Регалия',
          required: true,
        },
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          label: 'Фото',
          required: true,
        },
        {
          name: 'bio',
          type: 'richText',
          label: 'Биография',
          editor: lexicalEditor({}),
          required: true,
        },
        {
          name: 'socialLinks',
          type: 'array',
          label: 'Ссылки на соцсети',
          fields: [
            {
              name: 'platform',
              type: 'select',
              label: 'Платформа',
              options: [
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Twitter/X', value: 'twitter' },
                { label: 'GitHub', value: 'github' },
                { label: 'Website', value: 'website' },
                { label: 'Другое', value: 'other' },
              ],
            },
            {
              name: 'url',
              type: 'url',
              label: 'URL профиля',
              required: true,
            },
          ],
        },
        {
          name: 'expertise',
          type: 'array',
          label: 'Области экспертизы',
          fields: [
            {
              name: 'area',
              type: 'text',
              label: 'Область',
              required: true,
            },
          ],
        },
        {
          name: 'achievements',
          type: 'array',
          label: 'Достижения/Награды',
          fields: [
            {
              name: 'achievement',
              type: 'text',
              label: 'Достижение',
              required: true,
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
          defaultValue: 'photoLeft',
          options: [
            { label: 'Фото слева, текст справа', value: 'photoLeft' },
            { label: 'Фото справа, текст слева', value: 'photoRight' },
            { label: 'Фото сверху, текст снизу', value: 'photoTop' },
            { label: 'Карточка', value: 'card' },
          ],
        },
        {
          name: 'showTitle',
          type: 'checkbox',
          label: 'Показывать должность/регалию',
          defaultValue: true,
        },
        {
          name: 'showBio',
          type: 'checkbox',
          label: 'Показывать биографию',
          defaultValue: true,
        },
        {
          name: 'bioLength',
          type: 'select',
          label: 'Длина биографии',
          defaultValue: 'full',
          admin: {
            condition: (data, siblingData) => siblingData?.showBio,
          },
          options: [
            { label: 'Полная', value: 'full' },
            { label: 'Краткая (с кнопкой "Читать далее")', value: 'short' },
          ],
        },
        {
          name: 'showSocialLinks',
          type: 'checkbox',
          label: 'Показывать ссылки на соцсети',
          defaultValue: true,
        },
        {
          name: 'showExpertise',
          type: 'checkbox',
          label: 'Показывать области экспертизы',
          defaultValue: true,
        },
        {
          name: 'showAchievements',
          type: 'checkbox',
          label: 'Показывать достижения',
          defaultValue: true,
        },
        {
          name: 'linkToFullProfile',
          type: 'checkbox',
          label: 'Добавить ссылку на полный профиль (если есть)',
          defaultValue: false,
        },
        {
          name: 'profilePageUrl',
          type: 'text',
          label: 'URL страницы профиля',
          admin: {
            condition: (data, siblingData) => siblingData?.linkToFullProfile,
          },
        },
        {
          name: 'backgroundColor',
          type: 'text',
          label: 'Цвет фона (HEX, rgba)',
        },
      ],
    },
  ],
}

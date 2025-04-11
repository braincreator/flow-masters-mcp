import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Curriculum: Block = {
  slug: 'curriculum',
  interfaceName: 'CurriculumBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока с программой обучения',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Подзаголовок или краткое описание программы',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Общее описание программы обучения',
      },
    },
    {
      name: 'courseId',
      type: 'text',
      label: 'ID курса (опционально)',
      admin: {
        description: 'Если хотите связать с существующим курсом в базе данных',
      },
    },
    {
      name: 'modules',
      type: 'array',
      label: 'Модули программы',
      admin: {
        description: 'Модули и уроки в программе обучения',
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
          name: 'duration',
          type: 'text',
          label: 'Продолжительность',
          admin: {
            description: 'Например: "2 недели" или "10 часов"',
          },
        },
        {
          name: 'topics',
          type: 'array',
          label: 'Темы модуля',
          admin: {
            description: 'Отдельные темы или уроки в модуле',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Название темы/урока',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Описание темы/урока',
            },
            {
              name: 'duration',
              type: 'text',
              label: 'Продолжительность',
              admin: {
                description: 'Например: "45 минут" или "2 часа"',
              },
            },
            {
              name: 'learningFormat',
              type: 'select',
              label: 'Формат обучения',
              options: [
                { label: 'Лекция', value: 'lecture' },
                { label: 'Практическое занятие', value: 'practical' },
                { label: 'Семинар', value: 'seminar' },
                { label: 'Самостоятельная работа', value: 'self-study' },
                { label: 'Практическое задание', value: 'assignment' },
                { label: 'Тест/Опрос', value: 'test' },
              ],
            },
            {
              name: 'materials',
              type: 'array',
              label: 'Учебные материалы',
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  label: 'Тип материала',
                  options: [
                    { label: 'Видео', value: 'video' },
                    { label: 'Презентация', value: 'presentation' },
                    { label: 'Документ', value: 'document' },
                    { label: 'Ссылка', value: 'link' },
                    { label: 'Книга', value: 'book' },
                  ],
                },
                {
                  name: 'title',
                  type: 'text',
                  label: 'Название',
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  label: 'URL',
                  admin: {
                    description: 'Ссылка на материал (если применимо)',
                  },
                },
                {
                  name: 'file',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Файл',
                  admin: {
                    description: 'Загружаемый файл (если применимо)',
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'skills',
          type: 'array',
          label: 'Приобретаемые навыки',
          admin: {
            description: 'Навыки, которые получит студент после прохождения модуля',
          },
          fields: [
            {
              name: 'skill',
              type: 'text',
              label: 'Навык',
              required: true,
            },
          ],
        },
        {
          name: 'projects',
          type: 'array',
          label: 'Проекты',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Название проекта',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Описание проекта',
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Изображение',
            },
          ],
        },
        {
          name: 'isAdvanced',
          type: 'checkbox',
          label: 'Продвинутый модуль',
          admin: {
            description: 'Отметьте, если это продвинутый или сложный модуль',
          },
        },
      ],
    },
    {
      name: 'prerequisites',
      type: 'array',
      label: 'Предварительные требования',
      admin: {
        description: 'Что должен знать студент перед началом обучения',
      },
      fields: [
        {
          name: 'prerequisite',
          type: 'text',
          label: 'Требование',
          required: true,
        },
      ],
    },
    {
      name: 'learningOutcomes',
      type: 'array',
      label: 'Результаты обучения',
      admin: {
        description: 'Чему научится студент по окончании программы',
      },
      fields: [
        {
          name: 'outcome',
          type: 'text',
          label: 'Результат',
          required: true,
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Макет отображения',
      defaultValue: 'timeline',
      options: [
        { label: 'Таймлайн', value: 'timeline' },
        { label: 'Вкладки', value: 'tabs' },
        { label: 'Аккордеон', value: 'accordion' },
        { label: 'Карточки', value: 'cards' },
        { label: 'Список', value: 'list' },
      ],
    },
    {
      name: 'showProgress',
      type: 'checkbox',
      label: 'Показывать прогресс',
      defaultValue: true,
      admin: {
        description: 'Отображать индикаторы прогресса (для авторизованных пользователей)',
      },
    },
    {
      name: 'callToAction',
      type: 'group',
      label: 'Призыв к действию',
      fields: [
        {
          name: 'text',
          type: 'text',
          label: 'Текст',
          admin: {
            description: 'Текст призыва к действию, например "Записаться на курс"',
          },
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          admin: {
            description: 'Ссылка на страницу записи или детальной информации',
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
    singular: 'Блок программы обучения',
    plural: 'Блоки программы обучения',
  },
}

import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const VideoLessons: Block = {
  slug: 'videoLessons',
  interfaceName: 'VideoLessonsBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока видео-уроков',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Краткое описание блока или темы уроков',
      },
    },
    {
      name: 'lessonsSource',
      type: 'select',
      label: 'Источник видео-уроков',
      defaultValue: 'manual',
      options: [
        { label: 'Ручное добавление', value: 'manual' },
        { label: 'Коллекция', value: 'collection' },
        { label: 'API', value: 'api' },
      ],
    },
    {
      name: 'lessons',
      type: 'array',
      label: 'Видео-уроки',
      admin: {
        condition: (data, siblingData) => siblingData?.lessonsSource === 'manual',
        description: 'Список видео-уроков для отображения',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Название урока',
          required: true,
        },
        {
          name: 'description',
          type: 'richText',
          label: 'Описание урока',
          editor: lexicalEditor({}),
        },
        {
          name: 'videoSourceType',
          type: 'select',
          label: 'Источник видео',
          defaultValue: 'upload',
          options: [
            { label: 'Загрузить файл', value: 'upload' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Vimeo', value: 'vimeo' },
            { label: 'Внешний URL', value: 'externalUrl' },
          ],
        },
        {
          name: 'videoFile',
          type: 'upload',
          relationTo: 'media',
          label: 'Видеофайл',
          admin: {
            condition: (data, siblingData) => siblingData?.videoSourceType === 'upload',
          },
        },
        {
          name: 'videoUrl',
          type: 'text',
          label: 'URL видео (YouTube, Vimeo или внешний)',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.videoSourceType === 'youtube' ||
              siblingData?.videoSourceType === 'vimeo' ||
              siblingData?.videoSourceType === 'externalUrl',
          },
        },
        {
          name: 'thumbnail',
          type: 'upload',
          relationTo: 'media',
          label: 'Миниатюра',
        },
        {
          name: 'duration',
          type: 'number',
          label: 'Длительность (секунды)',
        },
        {
          name: 'chapters',
          type: 'array',
          label: 'Главы/Тайм-коды',
          fields: [
            {
              name: 'timestamp',
              type: 'number',
              label: 'Тайм-код (секунды)',
              required: true,
              min: 0,
            },
            {
              name: 'title',
              type: 'text',
              label: 'Название главы',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Краткое описание главы',
            },
          ],
        },
        {
          name: 'interactiveElements',
          type: 'array',
          label: 'Интерактивные элементы',
          fields: [
            {
              name: 'timestamp',
              type: 'number',
              label: 'Тайм-код появления (секунды)',
              required: true,
            },
            {
              name: 'elementType',
              type: 'select',
              label: 'Тип элемента',
              options: [
                { label: 'Вопрос (викторина)', value: 'quiz' },
                { label: 'Опрос', value: 'poll' },
                { label: 'Ссылка', value: 'link' },
                { label: 'Примечание', value: 'note' },
                { label: 'Призыв к действию', value: 'cta' },
              ],
            },
            {
              name: 'quizQuestion',
              type: 'textarea',
              label: 'Вопрос викторины',
              admin: {
                condition: (data, siblingData) => siblingData?.elementType === 'quiz',
              },
            },
            {
              name: 'quizOptions',
              type: 'array',
              label: 'Варианты ответа викторины',
              admin: {
                condition: (data, siblingData) => siblingData?.elementType === 'quiz',
              },
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  label: 'Текст варианта',
                  required: true,
                },
                {
                  name: 'isCorrect',
                  type: 'checkbox',
                  label: 'Правильный ответ',
                  defaultValue: false,
                },
              ],
            },
            {
              name: 'pollQuestion',
              type: 'textarea',
              label: 'Вопрос опроса',
              admin: {
                condition: (data, siblingData) => siblingData?.elementType === 'poll',
              },
            },
            {
              name: 'pollOptions',
              type: 'array',
              label: 'Варианты ответа опроса',
              admin: {
                condition: (data, siblingData) => siblingData?.elementType === 'poll',
              },
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  label: 'Текст варианта',
                  required: true,
                },
              ],
            },
            {
              name: 'linkUrl',
              type: 'text',
              label: 'URL ссылки',
              admin: {
                condition: (data, siblingData) => siblingData?.elementType === 'link',
              },
            },
            {
              name: 'linkLabel',
              type: 'text',
              label: 'Текст ссылки',
              admin: {
                condition: (data, siblingData) => siblingData?.elementType === 'link',
              },
            },
            {
              name: 'noteText',
              type: 'richText',
              label: 'Текст примечания',
              editor: lexicalEditor({}),
              admin: {
                condition: (data, siblingData) => siblingData?.elementType === 'note',
              },
            },
            {
              name: 'ctaText',
              type: 'text',
              label: 'Текст призыва к действию',
              admin: {
                condition: (data, siblingData) => siblingData?.elementType === 'cta',
              },
            },
            {
              name: 'ctaUrl',
              type: 'text',
              label: 'URL призыва к действию',
              admin: {
                condition: (data, siblingData) => siblingData?.elementType === 'cta',
              },
            },
            {
              name: 'pauseVideo',
              type: 'checkbox',
              label: 'Пауза видео при появлении',
              defaultValue: true,
            },
            {
              name: 'duration',
              type: 'number',
              label: 'Длительность показа (секунды, 0 - до закрытия)',
              defaultValue: 0,
            },
          ],
        },
        {
          name: 'transcript',
          type: 'richText',
          label: 'Транскрипция',
          editor: lexicalEditor({}),
        },
        {
          name: 'attachments',
          type: 'array',
          label: 'Прикрепленные материалы',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Название материала',
              required: true,
            },
            {
              name: 'file',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
          ],
        },
        {
          name: 'level',
          type: 'select',
          label: 'Уровень сложности',
          options: [
            { label: 'Начальный', value: 'beginner' },
            { label: 'Средний', value: 'intermediate' },
            { label: 'Продвинутый', value: 'advanced' },
          ],
        },
        {
          name: 'tags',
          type: 'array',
          label: 'Теги',
          fields: [
            {
              name: 'tag',
              type: 'text',
              label: 'Тег',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'collectionSettings',
      type: 'group',
      label: 'Настройки коллекции',
      admin: {
        condition: (data, siblingData) => siblingData?.lessonsSource === 'collection',
      },
      fields: [
        {
          name: 'targetCollection',
          type: 'text',
          label: 'Lesson Collection Slug',
          required: true,
          admin: {
            description: 'Введите слаг коллекции, из которой нужно брать видео-уроки.',
          },
        },
        {
          name: 'limit',
          type: 'number',
          label: 'Лимит уроков',
          defaultValue: 10,
        },
        {
          name: 'sortField',
          type: 'text',
          label: 'Поле для сортировки',
          defaultValue: 'order', // Предполагаем, что у уроков есть поле order
        },
        {
          name: 'sortDirection',
          type: 'select',
          label: 'Направление сортировки',
          defaultValue: 'asc',
          options: [
            { label: 'По возрастанию', value: 'asc' },
            { label: 'По убыванию', value: 'desc' },
          ],
        },
        {
          name: 'filters',
          type: 'array',
          label: 'Фильтры',
          fields: [
            {
              name: 'field',
              type: 'text',
              label: 'Поле',
              required: true,
            },
            {
              name: 'operator',
              type: 'select',
              label: 'Оператор',
              defaultValue: 'equals',
              options: [
                { label: 'Равно', value: 'equals' },
                { label: 'Не равно', value: 'not_equals' },
                { label: 'Содержит', value: 'contains' },
                { label: 'В списке', value: 'in' },
              ],
            },
            {
              name: 'value',
              type: 'text',
              label: 'Значение',
            },
          ],
        },
      ],
    },
    {
      name: 'apiSettings',
      type: 'group',
      label: 'Настройки API',
      admin: {
        condition: (data, siblingData) => siblingData?.lessonsSource === 'api',
      },
      fields: [
        {
          name: 'apiUrl',
          type: 'text',
          label: 'URL API',
          required: true,
        },
        // ... Дополнительные настройки API (ключ, метод, маппинг)
      ],
    },
    {
      name: 'playerSettings',
      type: 'group',
      label: 'Настройки плеера',
      fields: [
        {
          name: 'layout',
          type: 'select',
          label: 'Расположение плеера и списка уроков',
          defaultValue: 'playlistRight',
          options: [
            { label: 'Плейлист справа', value: 'playlistRight' },
            { label: 'Плейлист слева', value: 'playlistLeft' },
            { label: 'Плейлист снизу', value: 'playlistBottom' },
            { label: 'Только плеер', value: 'playerOnly' },
            { label: 'Только плейлист', value: 'playlistOnly' },
          ],
        },
        {
          name: 'autoplay',
          type: 'checkbox',
          label: 'Автовоспроизведение следующего урока',
          defaultValue: false,
        },
        {
          name: 'showControls',
          type: 'checkbox',
          label: 'Показывать стандартные элементы управления плеером',
          defaultValue: true,
        },
        {
          name: 'showChapters',
          type: 'checkbox',
          label: 'Показывать главы/тайм-коды',
          defaultValue: true,
        },
        {
          name: 'showTranscript',
          type: 'checkbox',
          label: 'Показывать транскрипцию',
          defaultValue: true,
        },
        {
          name: 'enablePictureInPicture',
          type: 'checkbox',
          label: 'Включить режим Картинка в картинке',
          defaultValue: true,
        },
        {
          name: 'playbackRates',
          type: 'array',
          label: 'Доступные скорости воспроизведения',
          defaultValue: [{ rate: 1 }, { rate: 1.25 }, { rate: 1.5 }, { rate: 2 }],
          fields: [
            {
              name: 'rate',
              type: 'number',
              label: 'Скорость (например, 1.5)',
              required: true,
            },
          ],
        },
        {
          name: 'rememberPlaybackPosition',
          type: 'checkbox',
          label: 'Запоминать позицию воспроизведения',
          defaultValue: true,
        },
        {
          name: 'markAsCompleted',
          type: 'select',
          label: 'Помечать урок как завершенный',
          defaultValue: 'auto',
          options: [
            { label: 'Автоматически (при 90% просмотра)', value: 'auto' },
            { label: 'Вручную (кнопка)', value: 'manual' },
            { label: 'Не помечать', value: 'none' },
          ],
        },
      ],
    },
  ],
}

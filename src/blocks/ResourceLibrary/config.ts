import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const ResourceLibrary: Block = {
  slug: 'resourceLibrary',
  interfaceName: 'ResourceLibraryBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока библиотеки ресурсов',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Подзаголовок или краткое описание блока',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Общее описание библиотеки ресурсов',
      },
    },
    {
      name: 'displayType',
      type: 'select',
      label: 'Тип отображения',
      defaultValue: 'grid',
      options: [
        { label: 'Сетка', value: 'grid' },
        { label: 'Список', value: 'list' },
        { label: 'Карточки', value: 'cards' },
        { label: 'Дерево', value: 'tree' },
      ],
    },
    {
      name: 'resourcesSource',
      type: 'select',
      label: 'Источник ресурсов',
      defaultValue: 'manual',
      options: [
        { label: 'Ручное добавление', value: 'manual' },
        { label: 'Коллекция', value: 'collection' },
        { label: 'API', value: 'api' },
      ],
    },
    {
      name: 'categories',
      type: 'array',
      label: 'Категории ресурсов',
      admin: {
        description: 'Структура категорий для организации ресурсов',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Название категории',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Описание категории',
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: 'Иконка категории',
        },
        {
          name: 'slug',
          type: 'text',
          label: 'Идентификатор категории',
          admin: {
            description: 'Уникальный идентификатор для URL',
          },
        },
        {
          name: 'parentCategory',
          type: 'text',
          label: 'Родительская категория',
          admin: {
            description: 'Slug родительской категории (если это подкатегория)',
          },
        },
        {
          name: 'order',
          type: 'number',
          label: 'Порядок',
          defaultValue: 0,
          admin: {
            description: 'Порядок отображения категории',
          },
        },
      ],
    },
    {
      name: 'resources',
      type: 'array',
      label: 'Ресурсы',
      admin: {
        condition: (data, siblingData) => siblingData?.resourcesSource === 'manual',
        description: 'Список ресурсов для отображения',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Название ресурса',
          required: true,
        },
        {
          name: 'description',
          type: 'richText',
          label: 'Описание ресурса',
          editor: lexicalEditor({}),
        },
        {
          name: 'type',
          type: 'select',
          label: 'Тип ресурса',
          defaultValue: 'article',
          options: [
            { label: 'Статья', value: 'article' },
            { label: 'Видео', value: 'video' },
            { label: 'Курс', value: 'course' },
            { label: 'Инструмент', value: 'tool' },
            { label: 'Книга', value: 'book' },
            { label: 'Подкаст', value: 'podcast' },
            { label: 'Туториал', value: 'tutorial' },
            { label: 'Презентация', value: 'presentation' },
            { label: 'Шаблон', value: 'template' },
            { label: 'API', value: 'api' },
            { label: 'Код', value: 'code' },
            { label: 'Датасет', value: 'dataset' },
            { label: 'Другое', value: 'other' },
          ],
        },
        {
          name: 'thumbnail',
          type: 'upload',
          relationTo: 'media',
          label: 'Миниатюра',
        },
        {
          name: 'categoryIds',
          type: 'array',
          label: 'Категории',
          fields: [
            {
              name: 'category',
              type: 'text',
              label: 'Категория',
              required: true,
              admin: {
                description: 'Slug категории',
              },
            },
          ],
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL ресурса',
          admin: {
            description: 'Внешняя ссылка или внутренний путь к ресурсу',
          },
        },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          label: 'Файл',
          admin: {
            description: 'Загружаемый файл ресурса (если применимо)',
          },
        },
        {
          name: 'author',
          type: 'group',
          label: 'Автор',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Имя автора',
            },
            {
              name: 'avatar',
              type: 'upload',
              relationTo: 'media',
              label: 'Аватар',
            },
            {
              name: 'bio',
              type: 'textarea',
              label: 'О авторе',
            },
          ],
        },
        {
          name: 'createdAt',
          type: 'date',
          label: 'Дата создания',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'updatedAt',
          type: 'date',
          label: 'Дата обновления',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
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
        {
          name: 'level',
          type: 'select',
          label: 'Уровень сложности',
          options: [
            { label: 'Начальный', value: 'beginner' },
            { label: 'Средний', value: 'intermediate' },
            { label: 'Продвинутый', value: 'advanced' },
            { label: 'Экспертный', value: 'expert' },
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
            },
            {
              name: 'unit',
              type: 'select',
              label: 'Единица измерения',
              defaultValue: 'minutes',
              options: [
                { label: 'Минут', value: 'minutes' },
                { label: 'Часов', value: 'hours' },
                { label: 'Дней', value: 'days' },
                { label: 'Недель', value: 'weeks' },
              ],
            },
          ],
        },
        {
          name: 'isFeatured',
          type: 'checkbox',
          label: 'Рекомендуемый ресурс',
          defaultValue: false,
        },
        {
          name: 'isExternal',
          type: 'checkbox',
          label: 'Внешний ресурс',
          defaultValue: false,
        },
        {
          name: 'accessLevel',
          type: 'select',
          label: 'Уровень доступа',
          defaultValue: 'free',
          options: [
            { label: 'Бесплатный', value: 'free' },
            { label: 'Премиум', value: 'premium' },
            { label: 'Только для участников', value: 'members' },
          ],
        },
        {
          name: 'viewCount',
          type: 'number',
          label: 'Количество просмотров',
          defaultValue: 0,
        },
        {
          name: 'downloadCount',
          type: 'number',
          label: 'Количество загрузок',
          defaultValue: 0,
        },
        {
          name: 'rating',
          type: 'group',
          label: 'Рейтинг',
          fields: [
            {
              name: 'average',
              type: 'number',
              label: 'Средний рейтинг',
              defaultValue: 0,
              min: 0,
              max: 5,
              admin: {
                step: 0.1,
              },
            },
            {
              name: 'count',
              type: 'number',
              label: 'Количество оценок',
              defaultValue: 0,
            },
          ],
        },
        {
          name: 'relatedResources',
          type: 'array',
          label: 'Связанные ресурсы',
          fields: [
            {
              name: 'resourceId',
              type: 'text',
              label: 'ID ресурса',
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
        condition: (data, siblingData) => siblingData?.resourcesSource === 'collection',
      },
      fields: [
        {
          name: 'collection',
          type: 'text',
          label: 'Название коллекции',
          required: true,
          admin: {
            description: 'Название коллекции с ресурсами',
          },
        },
        {
          name: 'limit',
          type: 'number',
          label: 'Лимит ресурсов',
          defaultValue: 20,
        },
        {
          name: 'sortField',
          type: 'text',
          label: 'Поле для сортировки',
          defaultValue: 'createdAt',
        },
        {
          name: 'sortDirection',
          type: 'select',
          label: 'Направление сортировки',
          defaultValue: 'desc',
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
                { label: 'Больше', value: 'greater_than' },
                { label: 'Меньше', value: 'less_than' },
                { label: 'Существует', value: 'exists' },
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
        condition: (data, siblingData) => siblingData?.resourcesSource === 'api',
      },
      fields: [
        {
          name: 'apiUrl',
          type: 'text',
          label: 'URL API',
          required: true,
        },
        {
          name: 'apiKey',
          type: 'text',
          label: 'API ключ',
        },
        {
          name: 'method',
          type: 'select',
          label: 'HTTP метод',
          defaultValue: 'GET',
          options: [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
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
          name: 'params',
          type: 'array',
          label: 'Параметры запроса',
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
          name: 'responseMapping',
          type: 'group',
          label: 'Мапинг ответа',
          fields: [
            {
              name: 'items',
              type: 'text',
              label: 'Путь к массиву элементов',
            },
            {
              name: 'title',
              type: 'text',
              label: 'Поле с названием',
              defaultValue: 'title',
            },
            {
              name: 'description',
              type: 'text',
              label: 'Поле с описанием',
              defaultValue: 'description',
            },
            {
              name: 'thumbnail',
              type: 'text',
              label: 'Поле с миниатюрой',
              defaultValue: 'thumbnail',
            },
            {
              name: 'url',
              type: 'text',
              label: 'Поле с URL',
              defaultValue: 'url',
            },
          ],
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Настройки отображения',
      fields: [
        {
          name: 'enableFiltering',
          type: 'checkbox',
          label: 'Включить фильтрацию',
          defaultValue: true,
        },
        {
          name: 'enableSearch',
          type: 'checkbox',
          label: 'Включить поиск',
          defaultValue: true,
        },
        {
          name: 'enableSorting',
          type: 'checkbox',
          label: 'Включить сортировку',
          defaultValue: true,
        },
        {
          name: 'enableFavorites',
          type: 'checkbox',
          label: 'Включить избранное',
          defaultValue: false,
        },
        {
          name: 'enableRating',
          type: 'checkbox',
          label: 'Включить рейтинг',
          defaultValue: false,
        },
        {
          name: 'enableSharing',
          type: 'checkbox',
          label: 'Включить поделиться',
          defaultValue: true,
        },
        {
          name: 'showCategoriesNav',
          type: 'checkbox',
          label: 'Показывать навигацию по категориям',
          defaultValue: true,
        },
        {
          name: 'itemsPerPage',
          type: 'number',
          label: 'Элементов на странице',
          defaultValue: 12,
        },
        {
          name: 'itemsPerRow',
          type: 'select',
          label: 'Элементов в ряду',
          defaultValue: '3',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.displayType === 'grid' || siblingData?.displayType === 'cards',
          },
          options: [
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
          ],
        },
        {
          name: 'showTags',
          type: 'checkbox',
          label: 'Показывать теги',
          defaultValue: true,
        },
        {
          name: 'showCategories',
          type: 'checkbox',
          label: 'Показывать категории',
          defaultValue: true,
        },
        {
          name: 'showAuthor',
          type: 'checkbox',
          label: 'Показывать автора',
          defaultValue: true,
        },
        {
          name: 'showDate',
          type: 'checkbox',
          label: 'Показывать дату',
          defaultValue: true,
        },
        {
          name: 'showDescription',
          type: 'checkbox',
          label: 'Показывать описание',
          defaultValue: true,
        },
        {
          name: 'truncateDescription',
          type: 'number',
          label: 'Максимальная длина описания',
          defaultValue: 120,
          admin: {
            condition: (data, siblingData) => siblingData?.showDescription,
          },
        },
      ],
    },
  ],
}

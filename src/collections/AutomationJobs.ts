import { CollectionConfig } from 'payload/types'
import { isAdmin, isAdminOrEditor } from '../access/isAdmin'

const AutomationJobs: CollectionConfig = {
  slug: 'automation-jobs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'triggerType', 'lastRun', 'nextRun'],
    group: 'Automation',
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Название задания',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Активно',
          value: 'active',
        },
        {
          label: 'Приостановлено',
          value: 'paused',
        },
        {
          label: 'Завершено',
          value: 'completed',
        },
        {
          label: 'Ошибка',
          value: 'error',
        },
      ],
      defaultValue: 'active',
      label: 'Статус',
    },
    {
      name: 'jobType',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Создание курса',
          value: 'create_course',
        },
        {
          label: 'Обновление курса',
          value: 'update_course',
        },
        {
          label: 'Создание лендинга',
          value: 'create_landing',
        },
        {
          label: 'Создание воронки',
          value: 'create_funnel',
        },
        {
          label: 'Полный комплект',
          value: 'full_package',
        },
      ],
      defaultValue: 'create_course',
      label: 'Тип задания',
    },
    {
      name: 'triggerType',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Расписание',
          value: 'schedule',
        },
        {
          label: 'Событие',
          value: 'event',
        },
        {
          label: 'Вручную',
          value: 'manual',
        },
      ],
      defaultValue: 'manual',
      label: 'Тип триггера',
    },
    {
      name: 'schedule',
      type: 'group',
      label: 'Расписание',
      admin: {
        condition: (data) => data.triggerType === 'schedule',
      },
      fields: [
        {
          name: 'frequency',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Ежедневно',
              value: 'daily',
            },
            {
              label: 'Еженедельно',
              value: 'weekly',
            },
            {
              label: 'Ежемесячно',
              value: 'monthly',
            },
            {
              label: 'Пользовательское',
              value: 'custom',
            },
          ],
          defaultValue: 'weekly',
          label: 'Частота',
        },
        {
          name: 'time',
          type: 'text',
          required: true,
          defaultValue: '00:00',
          label: 'Время (HH:MM)',
          admin: {
            condition: (data) => data.schedule?.frequency !== 'custom',
          },
        },
        {
          name: 'dayOfWeek',
          type: 'select',
          options: [
            { label: 'Понедельник', value: '1' },
            { label: 'Вторник', value: '2' },
            { label: 'Среда', value: '3' },
            { label: 'Четверг', value: '4' },
            { label: 'Пятница', value: '5' },
            { label: 'Суббота', value: '6' },
            { label: 'Воскресенье', value: '0' },
          ],
          defaultValue: '1',
          label: 'День недели',
          admin: {
            condition: (data) => data.schedule?.frequency === 'weekly',
          },
        },
        {
          name: 'dayOfMonth',
          type: 'number',
          min: 1,
          max: 31,
          defaultValue: 1,
          label: 'День месяца',
          admin: {
            condition: (data) => data.schedule?.frequency === 'monthly',
          },
        },
        {
          name: 'cronExpression',
          type: 'text',
          label: 'Cron-выражение',
          admin: {
            description: 'Например: 0 0 * * *',
            condition: (data) => data.schedule?.frequency === 'custom',
          },
        },
      ],
    },
    {
      name: 'eventTrigger',
      type: 'group',
      label: 'Событие-триггер',
      admin: {
        condition: (data) => data.triggerType === 'event',
      },
      fields: [
        {
          name: 'eventType',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Создание пользователя',
              value: 'user_created',
            },
            {
              label: 'Запись на курс',
              value: 'course_enrollment',
            },
            {
              label: 'Завершение курса',
              value: 'course_completion',
            },
            {
              label: 'Новый комментарий',
              value: 'new_comment',
            },
            {
              label: 'Новый заказ',
              value: 'new_order',
            },
          ],
          defaultValue: 'user_created',
          label: 'Тип события',
        },
        {
          name: 'conditions',
          type: 'array',
          label: 'Условия',
          fields: [
            {
              name: 'field',
              type: 'text',
              required: true,
              label: 'Поле',
            },
            {
              name: 'operator',
              type: 'select',
              required: true,
              options: [
                { label: 'Равно', value: 'equals' },
                { label: 'Не равно', value: 'not_equals' },
                { label: 'Содержит', value: 'contains' },
                { label: 'Не содержит', value: 'not_contains' },
                { label: 'Больше', value: 'greater_than' },
                { label: 'Меньше', value: 'less_than' },
              ],
              defaultValue: 'equals',
              label: 'Оператор',
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              label: 'Значение',
            },
          ],
        },
      ],
    },
    {
      name: 'aiGenerationParams',
      type: 'group',
      label: 'Параметры генерации AI',
      admin: {
        description: 'Параметры для генерации курса с помощью AI',
      },
      fields: [
        {
          name: 'topic',
          type: 'text',
          required: true,
          label: 'Тема курса',
        },
        {
          name: 'targetAudience',
          type: 'text',
          label: 'Целевая аудитория',
        },
        {
          name: 'difficultyLevel',
          type: 'select',
          options: [
            { label: 'Начинающий', value: 'beginner' },
            { label: 'Средний', value: 'intermediate' },
            { label: 'Продвинутый', value: 'advanced' },
          ],
          defaultValue: 'beginner',
          label: 'Уровень сложности',
        },
        {
          name: 'includeQuizzes',
          type: 'checkbox',
          defaultValue: true,
          label: 'Включить тесты и задания',
        },
        {
          name: 'includeLanding',
          type: 'checkbox',
          defaultValue: true,
          label: 'Создать лендинг',
        },
        {
          name: 'includeFunnel',
          type: 'checkbox',
          defaultValue: true,
          label: 'Создать воронку',
        },
        {
          name: 'language',
          type: 'select',
          options: [
            { label: 'Русский', value: 'ru' },
            { label: 'English', value: 'en' },
          ],
          defaultValue: 'ru',
          label: 'Язык',
        },
        {
          name: 'moduleCount',
          type: 'number',
          min: 1,
          max: 10,
          defaultValue: 3,
          label: 'Количество модулей',
        },
        {
          name: 'lessonCount',
          type: 'number',
          min: 1,
          max: 10,
          defaultValue: 3,
          label: 'Уроков в модуле',
        },
        {
          name: 'model',
          type: 'select',
          options: [
            { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
            { label: 'GPT-4o', value: 'gpt-4o' },
            { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
          ],
          defaultValue: 'gpt-4-turbo',
          label: 'Модель AI',
        },
        {
          name: 'temperature',
          type: 'number',
          min: 0,
          max: 1,
          step: 0.1,
          defaultValue: 0.7,
          label: 'Температура',
        },
        {
          name: 'style',
          type: 'select',
          options: [
            { label: 'Профессиональный', value: 'professional' },
            { label: 'Академический', value: 'academic' },
            { label: 'Разговорный', value: 'conversational' },
          ],
          defaultValue: 'professional',
          label: 'Стиль изложения',
        },
        {
          name: 'focus',
          type: 'select',
          options: [
            { label: 'Сбалансированный', value: 'balanced' },
            { label: 'Теоретический', value: 'theory' },
            { label: 'Практический', value: 'practice' },
          ],
          defaultValue: 'balanced',
          label: 'Фокус курса',
        },
        {
          name: 'industrySpecific',
          type: 'text',
          label: 'Специфика отрасли',
        },
        {
          name: 'includeResources',
          type: 'checkbox',
          defaultValue: false,
          label: 'Добавить полезные ресурсы',
        },
        {
          name: 'includeAssignments',
          type: 'checkbox',
          defaultValue: false,
          label: 'Добавить практические задания',
        },
      ],
    },
    {
      name: 'templateId',
      type: 'relationship',
      relationTo: 'templates',
      hasMany: false,
      label: 'Шаблон',
      admin: {
        description: 'Выберите шаблон для создания курса',
      },
    },
    {
      name: 'courseId',
      type: 'relationship',
      relationTo: 'courses',
      hasMany: false,
      label: 'Курс',
      admin: {
        description: 'Выберите курс для обновления (только для типа "Обновление курса")',
        condition: (data) => data.jobType === 'update_course',
      },
    },
    {
      name: 'lastRun',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        readOnly: true,
      },
      label: 'Последний запуск',
    },
    {
      name: 'nextRun',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        readOnly: true,
      },
      label: 'Следующий запуск',
    },
    {
      name: 'runCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
      label: 'Количество запусков',
    },
    {
      name: 'lastResult',
      type: 'json',
      admin: {
        readOnly: true,
      },
      label: 'Результат последнего запуска',
    },
    {
      name: 'logs',
      type: 'array',
      admin: {
        readOnly: true,
      },
      label: 'Логи',
      fields: [
        {
          name: 'timestamp',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
          label: 'Время',
        },
        {
          name: 'message',
          type: 'text',
          label: 'Сообщение',
        },
        {
          name: 'level',
          type: 'select',
          options: [
            { label: 'Info', value: 'info' },
            { label: 'Warning', value: 'warning' },
            { label: 'Error', value: 'error' },
            { label: 'Success', value: 'success' },
          ],
          defaultValue: 'info',
          label: 'Уровень',
        },
        {
          name: 'details',
          type: 'json',
          label: 'Детали',
        },
      ],
    },
  ],
  timestamps: true,
}

export default AutomationJobs

import type { Block } from 'payload'

// Этот блок предназначен для настройки отслеживания событий в системах аналитики.
// Он может не иметь визуального представления на фронтенде,
// а использоваться для добавления data-атрибутов или скриптов к другим блокам/элементам.

export const EventTracker: Block = {
  slug: 'eventTracker',
  interfaceName: 'EventTrackerBlock',
  labels: {
    singular: 'Трекер Событий',
    plural: 'Трекеры Событий',
  },
  fields: [
    {
      name: 'eventName',
      type: 'text',
      label: 'Название события',
      required: true,
      admin: {
        description:
          'Название события, как оно будет отображаться в системе аналитики (например, "click_cta_button", "form_submission_success").',
      },
    },
    {
      name: 'analyticsSystem',
      type: 'select',
      label: 'Система аналитики',
      defaultValue: 'ga4',
      options: [
        { label: 'Google Analytics 4 (GA4)', value: 'ga4' },
        { label: 'Яндекс.Метрика', value: 'yandexMetrika' },
        { label: 'Mixpanel', value: 'mixpanel' },
        { label: 'Amplitude', value: 'amplitude' },
        { label: 'Пользовательский (dataLayer)', value: 'customDataLayer' },
        { label: 'Другое', value: 'other' },
      ],
    },
    {
      name: 'trigger',
      type: 'select',
      label: 'Триггер события',
      defaultValue: 'click',
      options: [
        { label: 'Клик по элементу', value: 'click' },
        { label: 'Появление элемента в видимой зоне', value: 'view' },
        { label: 'Отправка формы (успешно)', value: 'formSuccess' }, // Потребует интеграции с блоками форм
        { label: 'Пользовательское событие JS', value: 'customJS' },
      ],
      admin: {
        description: 'Условие, при котором будет отправлено событие.',
      },
    },
    {
      name: 'targetSelector',
      type: 'text',
      label: 'CSS Селектор целевого элемента',
      admin: {
        condition: (data, siblingData) =>
          siblingData?.trigger === 'click' || siblingData?.trigger === 'view',
        description:
          'Например: "#buy-button", ".cta-section a". Событие будет привязано к этому элементу.',
      },
    },
    {
      name: 'customEventNameJS',
      type: 'text',
      label: 'Имя пользовательского события JS',
      admin: {
        condition: (data, siblingData) => siblingData?.trigger === 'customJS',
        description: 'Имя события, которое будет инициировано в коде фронтенда.',
      },
    },
    {
      name: 'eventParameters',
      type: 'array',
      label: 'Параметры события',
      fields: [
        {
          name: 'paramName',
          type: 'text',
          label: 'Имя параметра',
          required: true,
        },
        {
          name: 'paramValueType',
          type: 'select',
          label: 'Тип значения',
          defaultValue: 'static',
          options: [
            { label: 'Статическое значение', value: 'static' },
            { label: 'Из data-атрибута элемента', value: 'dataAttribute' },
            { label: 'Из переменной JS', value: 'jsVariable' }, // Потребует доп. настройки на фронте
          ],
        },
        {
          name: 'paramValue',
          type: 'text',
          label: 'Значение параметра / Имя data-атрибута / Имя переменной JS',
          required: true,
        },
      ],
      admin: {
        description: 'Дополнительные данные, передаваемые вместе с событием.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Примечания (для администратора)',
      admin: {
        description: 'Любая дополнительная информация об этом трекере.',
      },
    },
    {
      name: 'isEnabled',
      type: 'checkbox',
      label: 'Трекер активен',
      defaultValue: true,
    },
    // Поле admin.hidden может сделать блок невидимым в интерфейсе добавления блоков,
    // если предполагается его использование только программно или в настройках других блоков.
    // admin: {
    //   hidden: true,
    // },
  ],
}

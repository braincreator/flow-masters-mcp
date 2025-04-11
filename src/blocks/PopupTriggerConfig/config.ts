import type { Block } from 'payload'

export const PopupTriggerConfig: Block = {
  slug: 'popupTriggerConfig',
  interfaceName: 'PopupTriggerConfigBlock',
  labels: {
    singular: 'Конфигуратор Попапа',
    plural: 'Конфигураторы Попапов',
  },
  graphQL: false, // Данные не нужны в GraphQL для рендеринга страницы
  fields: [
    {
      name: 'popupId',
      type: 'text',
      label: 'Идентификатор Попапа',
      required: true,
      admin: {
        description:
          'Уникальный ID (латиница, цифры, дефисы), который будет использоваться в JS для показа нужного попапа.',
      },
    },
    {
      name: 'triggerType',
      type: 'select',
      label: 'Триггер показа',
      required: true,
      options: [
        { label: 'При попытке ухода (Exit Intent)', value: 'exitIntent' },
        { label: 'При скролле страницы', value: 'scroll' },
        { label: 'По таймеру', value: 'timer' },
        { label: 'При клике на элемент', value: 'click' },
        // { label: 'При загрузке страницы', value: 'load' }, // Можно добавить
      ],
    },
    {
      name: 'scrollPercentage',
      type: 'number',
      label: 'Процент скролла',
      min: 1,
      max: 100,
      admin: {
        condition: (_, siblingData) => siblingData.triggerType === 'scroll',
        description: 'Показать попап, когда пользователь прокрутит N% страницы.',
      },
    },
    {
      name: 'timerSeconds',
      type: 'number',
      label: 'Задержка в секундах',
      min: 1,
      admin: {
        condition: (_, siblingData) => siblingData.triggerType === 'timer',
        description: 'Показать попап через N секунд после загрузки страницы.',
      },
    },
    {
      name: 'clickSelector',
      type: 'text',
      label: 'CSS Селектор элемента для клика',
      admin: {
        condition: (_, siblingData) => siblingData.triggerType === 'click',
        description: 'Например, #my-button или .show-popup-link',
      },
    },
    {
      name: 'displayFrequency',
      type: 'select',
      label: 'Частота показа',
      defaultValue: 'session',
      options: [
        { label: 'Каждый раз', value: 'always' },
        { label: 'Один раз за сессию', value: 'session' },
        { label: 'Один раз за N дней', value: 'oncePerDays' },
        { label: 'Только один раз (навсегда)', value: 'onceEver' },
      ],
    },
    {
      name: 'frequencyDays',
      type: 'number',
      label: "Количество дней (для 'раз в N дней')",
      min: 1,
      admin: {
        condition: (_, siblingData) => siblingData.displayFrequency === 'oncePerDays',
      },
    },
    // --- Опциональные, более сложные условия ---
    // {
    //   name: 'deviceVisibility',
    //   type: 'select',
    //   label: 'Показывать на устройствах',
    //   hasMany: true, // Позволит выбрать несколько
    //   options: [
    //     { label: 'Десктоп', value: 'desktop' },
    //     { label: 'Планшет', value: 'tablet' },
    //     { label: 'Мобильный', value: 'mobile' },
    //   ],
    //   defaultValue: ['desktop', 'tablet', 'mobile'],
    // },
    // {
    //   name: 'pageTargeting', // Требует сложной логики определения текущей страницы
    //   type: 'radio',
    //   label: 'Таргетинг по страницам',
    //   options: [...]
    // },
    // {
    //   name: 'userTargeting', // Требует интеграции с данными пользователя
    //   type: 'radio',
    //   label: 'Таргетинг по пользователям',
    //   options: [...]
    // },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Заметки (для чего этот попап)',
    },
    // Примечание: Этот блок невидим. Его данные (popupId, triggerType и т.д.)
    // должны считываться специальным JS-скриптом на фронтенде, который будет
    // отслеживать события (скролл, таймеры, клики, exit intent) и вызывать
    // функцию показа соответствующего попапа (например, модального окна),
    // контент которого может быть задан другим блоком или глобально.
  ],
}

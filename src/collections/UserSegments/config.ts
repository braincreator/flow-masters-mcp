import type { CollectionConfig, Field } from 'payload'

// Определяем поля, по которым можно сегментировать пользователя
// Это зависит от полей в вашей коллекции Users и связанных данных
const userSegmentationParameters: Field[] = [
  {
    label: 'Дата регистрации', // createdAt из Users
    value: 'registrationDate',
  },
  {
    label: 'Количество заказов', // Потребует агрегации из Orders
    value: 'orderCount',
  },
  {
    label: 'Общая сумма покупок', // Потребует агрегации из Orders
    value: 'totalSpent',
  },
  {
    label: 'Прошел курс (ID курса)', // Потребует проверки связи пользователя с курсами/прогрессом
    value: 'completedCourse',
  },
  {
    label: 'Имеет активную подписку (ID плана)', // Потребует проверки Subscriptions
    value: 'activeSubscriptionPlan',
  },
  {
    label: 'Роль пользователя', // поле roles в Users
    value: 'userRole',
  },
  {
    label: "Значение поля профиля (напр. 'city')", // Доступ к кастомным полям Users
    value: 'userProfileField',
  },
  {
    label: 'Источник регистрации (UTM)', // Если вы сохраняете UTM при регистрации
    value: 'registrationUtmSource',
  },
  {
    label: 'Посетил страницу (URL или ID)', // Потребует системы отслеживания посещений
    value: 'visitedPage',
  },
  // ... добавьте другие релевантные параметры
]

// Определяем возможные операторы
const operators: Field[] = [
  { label: 'Равно', value: 'equals' },
  { label: 'Не равно', value: 'notEquals' },
  { label: 'Содержит', value: 'contains' }, // Для текста или массивов
  { label: 'Не содержит', value: 'notContains' },
  { label: 'Больше чем', value: 'greaterThan' }, // Для чисел и дат
  { label: 'Меньше чем', value: 'lessThan' },
  { label: 'Больше или равно', value: 'greaterThanOrEqual' },
  { label: 'Меньше или равно', value: 'lessThanOrEqual' },
  { label: 'Существует (поле заполнено)', value: 'exists' },
  { label: 'Не существует (поле не заполнено)', value: 'doesNotExist' },
  { label: 'Зарегистрирован до (дата)', value: 'registeredBefore' },
  { label: 'Зарегистрирован после (дата)', value: 'registeredAfter' },
]

export const UserSegments: CollectionConfig = {
  slug: 'user-segments',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'description', 'updatedAt'],
    description: 'Определение правил для сегментации пользователей.',
  },
  labels: {
    singular: 'Сегмент Пользователей',
    plural: 'Сегменты Пользователей',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Название сегмента',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Идентификатор сегмента (slug)',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Латиница, цифры, дефисы. Используется в коде (напр., в DynamicContent).',
      },
      validate: (value) => {
        if (typeof value === 'string' && /^[a-z0-9-]+$/.test(value)) {
          return true
        }
        return 'Идентификатор должен содержать только строчные латинские буквы, цифры и дефис.'
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание сегмента (для чего он)',
    },
    {
      name: 'ruleGroups',
      type: 'array',
      label: 'Группы правил (условие ИЛИ между группами)',
      minRows: 1,
      labels: {
        singular: 'Группа правил (И)',
        plural: 'Группы правил (ИЛИ)',
      },
      admin: {
        description:
          'Пользователь попадает в сегмент, если выполняется хотя бы одна группа правил.',
      },
      fields: [
        {
          name: 'rules',
          type: 'array',
          label: 'Правила (условие И внутри группы)',
          minRows: 1,
          labels: {
            singular: 'Правило',
            plural: 'Правила',
          },
          admin: {
            description: 'Все правила в этой группе должны быть выполнены.',
          },
          fields: [
            {
              name: 'parameter',
              type: 'select',
              label: 'Параметр пользователя',
              options: userSegmentationParameters,
              required: true,
            },
            {
              name: 'operator',
              type: 'select',
              label: 'Оператор',
              options: operators,
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              label: 'Значение',
              admin: {
                description: 'Значение для сравнения. Для дат используйте формат YYYY-MM-DD.',
                condition: (_, siblingData) =>
                  siblingData.operator !== 'exists' && siblingData.operator !== 'doesNotExist',
              },
            },
            {
              name: 'profileFieldName',
              type: 'text',
              label: 'Имя поля профиля',
              admin: {
                condition: (_, siblingData) => siblingData.parameter === 'userProfileField',
                description: "Например, 'city' или 'company'.",
              },
            },
            // Валидация значения в зависимости от параметра/оператора (сложно в базе)
          ],
        },
      ],
    },
    // Примечание: Применение этих правил к пользователям требует отдельной логики
    // (хуки, фоновые задачи), которая будет анализировать данные пользователя
    // и добавлять/удалять ссылки на сегменты в его документе (например, поле `segments` в Users).
  ],
}

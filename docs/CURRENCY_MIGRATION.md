# Миграция модели цен

## Обзор изменений

В этом обновлении мы переходим от модели с базовой ценой в USD и конвертацией валют к модели с локализованными ценами для каждой локали. Это изменение упрощает работу с ценами и устраняет проблемы, связанные с конвертацией валют.

### Основные изменения

1. **Структура данных**:
   - Поле `price` теперь является локализуемым для каждой локали
   - Удалены поля `localizedPrices` и `basePrice`
   - Цены теперь хранятся непосредственно в локализованном виде

2. **Компоненты UI**:
   - Удалена логика конвертации валют
   - Компоненты теперь используют локализованные цены напрямую

3. **Платежная система**:
   - Платежи теперь обрабатываются в валюте, соответствующей локали пользователя
   - Удалена логика конвертации при создании платежей

4. **Заказы**:
   - Элементы заказов теперь содержат локализованные цены
   - Итоговые суммы заказов хранятся в формате, соответствующем локалям

## Инструкция по миграции

### Предварительные шаги

1. Создайте резервную копию базы данных
2. Убедитесь, что все изменения в коде закоммичены

### Запуск миграции

Для запуска миграции выполните следующую команду:

```bash
npm run migrate:currency
```

Скрипт выполнит следующие действия:

1. Преобразует существующие цены в локализованные для каждой локали
2. Обновит структуру данных в базе данных
3. Удалит устаревшие поля
4. Обновит заказы для соответствия новой модели цен

### После миграции

1. Проверьте корректность цен в админ-панели
2. Убедитесь, что все компоненты отображают цены правильно
3. Проверьте работу платежной системы с новой моделью цен
4. Проверьте правильность отображения заказов в админ-панели и корректность сумм

## Технические детали

### Изменения в схеме коллекций

#### Услуги (Services)

```typescript
// Было
{
  name: 'price',
  type: 'number',
  required: true,
  min: 0,
  admin: {
    description: 'Базовая цена в USD',
    position: 'sidebar',
  },
},
{
  name: 'localizedPrices',
  type: 'group',
  admin: {
    description: 'Локализованные цены',
  },
  fields: [
    {
      name: 'ru',
      type: 'number',
      min: 0,
    },
    {
      name: 'en',
      type: 'number',
      min: 0,
    },
  ],
},

// Стало
{
  name: 'price',
  type: 'number',
  required: true,
  min: 0,
  localized: true,
  admin: {
    description: 'Цена в локальной валюте',
    position: 'sidebar',
  },
},
```

#### Продукты (Products)

```typescript
// Было
{
  name: 'basePrice',
  type: 'number',
  required: true,
  min: 0,
  admin: {
    description: 'Base price in USD',
  },
},
{
  name: 'localizedPrices',
  type: 'group',
  admin: {
    description: 'Localized prices',
  },
  fields: [
    {
      name: 'ru',
      type: 'number',
      min: 0,
    },
    {
      name: 'en',
      type: 'number',
      min: 0,
    },
  ],
},

// Стало
{
  name: 'price',
  type: 'number',
  required: true,
  min: 0,
  localized: true,
  admin: {
    description: 'Цена в локальной валюте',
  },
},
```

#### Заказы (Orders)

```typescript
// Было
items: [
  {
    price: number, // Базовая цена в USD
    localizedPrices: {
      ru?: number,
      en?: number
    }
    // ...другие поля
  }
],
total: number, // Итоговая сумма в USD
subtotal: number, // Промежуточная сумма в USD

// Стало
items: [
  {
    price: {
      ru: number, // Цена в рублях
      en: number  // Цена в долларах
    }
    // ...другие поля
  }
],
total: {
  ru: { amount: number, currency: 'RUB' },
  en: { amount: number, currency: 'USD' }
},
subtotal: {
  ru: { amount: number, currency: 'RUB' },
  en: { amount: number, currency: 'USD' }
}
```

### Изменения в типах данных

```typescript
// Было
export interface Service {
  // ...
  price: number;
  // ...
  localizedPrices?: {
    ru?: number;
    en?: number;
    [key: string]: number | undefined;
  };
}

// Стало
export interface Service {
  // ...
  price: number | { [locale: string]: number };
  // ...
}
```

## Откат изменений

В случае необходимости отката изменений:

1. Восстановите базу данных из резервной копии
2. Откатите изменения в коде
3. Перезапустите приложение 
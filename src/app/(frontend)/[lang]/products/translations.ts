export const translations = {
  en: {
    pageTitle: 'Digital Products Store',
    pageDescription: 'Discover our collection of N8N workflows, Make.com automations, tutorials, and courses',
    sortOptions: {
      newest: 'Newest',
      priceLowToHigh: 'Price: Low to High',
      priceHighToLow: 'Price: High to Low'
    },
    categories: {
      all: 'All Categories',
      workflow: 'Workflow',
      automation: 'Automation',
      tutorial: 'Tutorial',
      course: 'Course',
      template: 'Template',
      integration: 'Integration'
    },
    filters: {
      categories: 'Categories',
      sort: 'Sort by',
      search: 'Search products',
      searchPlaceholder: 'Search products...',
      layout: {
        grid: 'Grid view',
        list: 'List view'
      }
    },
    pagination: {
      prev: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of'
    },
    noResults: 'No products found',
    meta: {
      title: 'Digital Store - AI Automation Solutions',
      description: 'Purchase N8N workflows, Make.com automations, tutorials, and courses'
    }
  },
  ru: {
    pageTitle: 'Магазин цифровых продуктов',
    pageDescription: 'Откройте для себя нашу коллекцию N8N воркфлоу, Make.com автоматизаций, руководств и курсов',
    sortOptions: {
      newest: 'Новые',
      priceLowToHigh: 'Цена: по возрастанию',
      priceHighToLow: 'Цена: по убыванию'
    },
    categories: {
      all: 'Все категории',
      workflow: 'Воркфлоу',
      automation: 'Автоматизация',
      tutorial: 'Руководство',
      course: 'Курс',
      template: 'Шаблон',
      integration: 'Интеграция'
    },
    filters: {
      categories: 'Категории',
      sort: 'Сортировка',
      search: 'Поиск продуктов',
      searchPlaceholder: 'Поиск продуктов...',
      layout: {
        grid: 'Сетка',
        list: 'Список'
      }
    },
    pagination: {
      prev: 'Назад',
      next: 'Вперед',
      page: 'Страница',
      of: 'из'
    },
    noResults: 'Продукты не найдены',
    meta: {
      title: 'Цифровой магазин - Решения AI автоматизации',
      description: 'Приобретите N8N воркфлоу, Make.com автоматизации, руководства и курсы'
    }
  }
} as const

export type ProductsTranslations = typeof translations
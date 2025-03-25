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
      },
      priceRange: {
        label: 'Price Range',
        min: 'Min',
        max: 'Max'
      },
      productType: {
        label: 'Product Type',
        all: 'All Types',
        digital: 'Digital Product',
        subscription: 'Subscription',
        service: 'Service',
        access: 'Feature Access'
      }
    },
    buttons: {
      buyNow: 'Buy Now',
      subscribe: 'Subscribe',
      bookService: 'Book Service',
      getAccess: 'Get Access',
      viewDemo: 'View Demo'
    },
    productDetails: {
      instantDelivery: 'Instant Delivery',
      fileSize: 'File Size',
      billingInterval: 'Billing Interval',
      autoRenewal: 'Automatic Renewal',
      duration: 'Duration',
      location: 'Location',
      validity: 'Valid for {period} days',
      unlimitedAccess: 'Unlimited access',
      features: 'Key Features',
      inStock: 'In Stock',
      securePayment: 'Secure payment',
      freeShipping: 'Free shipping on orders over $50',
      instantDelivery: 'Instant digital delivery',
      features: 'Features'
    },
    pagination: {
      prev: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of'
    },
    noResults: 'No products found'
  },
  ru: {
    pageTitle: 'Магазин Цифровых Продуктов',
    pageDescription: 'Откройте для себя нашу коллекцию рабочих процессов N8N, автоматизаций Make.com, руководств и курсов',
    sortOptions: {
      newest: 'Новые',
      priceLowToHigh: 'Цена: по возрастанию',
      priceHighToLow: 'Цена: по убыванию'
    },
    categories: {
      all: 'Все категории',
      workflow: 'Рабочий процесс',
      automation: 'Автоматизация',
      tutorial: 'Руководство',
      course: 'Курс',
      template: 'Шаблон',
      integration: 'Интеграция'
    },
    filters: {
      categories: 'Категории',
      sort: 'Сортировать по',
      search: 'Поиск продуктов',
      searchPlaceholder: 'Поиск продуктов...',
      layout: {
        grid: 'Сетка',
        list: 'Список'
      },
      priceRange: {
        label: 'Ценовой диапазон',
        min: 'Мин',
        max: 'Макс'
      },
      productType: {
        label: 'Тип продукта',
        all: 'Все типы',
        digital: 'Цифровой продукт',
        subscription: 'Подписка',
        service: 'Услуга',
        access: 'Доступ к функциям'
      }
    },
    buttons: {
      buyNow: 'Купить',
      subscribe: 'Подписаться',
      bookService: 'Заказать услугу',
      getAccess: 'Получить доступ',
      viewDemo: 'Смотреть демо'
    },
    productDetails: {
      instantDelivery: 'Мгновенная доставка',
      fileSize: 'Размер файла',
      billingInterval: 'Интервал оплаты',
      autoRenewal: 'Автопродление',
      duration: 'Длительность',
      location: 'Местоположение',
      validity: 'Действует {period} дней',
      unlimitedAccess: 'Безлимитный доступ',
      features: 'Основные характеристики',
      inStock: 'В наличии',
      securePayment: 'Безопасная оплата',
      freeShipping: 'Бесплатная доставка при заказе от $50',
      instantDelivery: 'Мгновенная цифровая доставка',
      features: 'Функции'
    },
    pagination: {
      prev: 'Назад',
      next: 'Вперед',
      page: 'Страница',
      of: 'из'
    },
    noResults: 'Продукты не найдены'
  }
} as const

export type ProductsTranslations = typeof translations

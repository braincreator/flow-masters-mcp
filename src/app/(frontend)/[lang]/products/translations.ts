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
      }
    },
    pagination: {
      prev: 'Previous',
      next: 'Next',
      page: 'Page',
      of: 'of'
    },
    noResults: 'No products found'
  }
  // Add other languages here
} as const

export type ProductsTranslations = typeof translations

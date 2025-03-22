import { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ProductsGrid } from '@/blocks/ProductsGrid/Component'
import { FilterBar } from '@/components/FilterBar'
import { DEFAULT_LOCALE, Locale } from '@/constants'

type Props = {
  params: Promise<{
    lang: string
  }>
  searchParams?: {
    category?: string
    search?: string
    sort?: string
    page?: string
    layout?: 'grid' | 'list'
  }
}

const translations = {
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

export default async function StorePage({ params, searchParams }: Props) {
  const { lang } = await params
  const currentLocale = (lang || DEFAULT_LOCALE) as Locale
  const t = translations[currentLocale]
  
  const payload = await getPayload({ config: configPromise })
  const searchParamsAwaited = await searchParams
  const products = await payload.find({
    collection: 'products',
    where: {
      status: {
        equals: 'published',
      },
    },
    locale: currentLocale,
    depth: 1,
  })

  // Get unique categories and translate them
  const categories = [...new Set(products.docs.map(product => product.category))]
    .map(category => ({
      label: t.categories[category as keyof typeof t.categories] || category,
      value: category,
    }))

  const sortOptions = [
    { label: t.sortOptions.newest, value: 'newest' },
    { label: t.sortOptions.priceLowToHigh, value: 'price-low' },
    { label: t.sortOptions.priceHighToLow, value: 'price-high' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t.pageTitle}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t.pageDescription}
          </p>
        </div>

        <FilterBar
          categories={categories}
          sortOptions={sortOptions}
          defaultLayout="grid"
          labels={{
            categories: t.filters.categories,
            sort: t.filters.sort,
            search: t.filters.search,
            searchPlaceholder: t.filters.searchPlaceholder,
            allCategories: t.categories.all,
            layout: t.filters.layout
          }}
        />

        <div className="mt-8">
          {products.docs.length > 0 ? (
            <ProductsGrid
              products={products.docs}
              productsPerPage={12}
              showPagination={true}
              layout={searchParamsAwaited?.layout || 'grid'}
              labels={{
                prev: t.pagination.prev,
                next: t.pagination.next,
                page: t.pagination.page,
                of: t.pagination.of
              }}
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t.noResults}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const currentLocale = (lang || DEFAULT_LOCALE) as Locale
  const t = translations[currentLocale]
  
  return {
    title: t.meta.title,
    description: t.meta.description,
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      type: 'website',
    },
  }
}

// Generate static params for all supported languages
export async function generateStaticParams() {
  const languages = ['en', 'ru']
  return languages.map((lang) => ({
    lang,
  }))
}

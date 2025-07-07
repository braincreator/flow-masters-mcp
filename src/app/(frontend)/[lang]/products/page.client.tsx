'use client'

import { FilterBar } from '@/components/FilterBar'
import { ProductsGrid } from '@/components/ProductsGrid'
import { type Locale } from '@/constants'
import type { Category, Product } from '@/payload-types'
import { translations } from './translations'
import { useFavorites } from '@/hooks/useFavorites'
import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import LoadingIndicator from '@/components/ui/LoadingIndicator'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface ProductsClientProps {
  products: Product[]
  categories: Category[]
  currentLocale: Locale
  searchParams: {
    category?: string
    search?: string
    sort?: string
    layout?: 'grid' | 'list'
    page?: string
    favorites?: string
  }
  totalPages: number
  currentPage: number
}

export default function ProductsClient({
  products: initialProducts,
  categories,
  currentLocale,
  searchParams: initialSearchParams,
  totalPages: initialTotalPages,
  currentPage: initialCurrentPage,
}: ProductsClientProps) {
  const t = translations[currentLocale as keyof typeof translations]
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State to hold products, which will be updated when filters change
  const [displayProducts, setDisplayProducts] = useState(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTotalPages, setCurrentTotalPages] = useState(initialTotalPages)
  const [currentPageNum, setCurrentPageNum] = useState(initialCurrentPage)

  const { favoriteProductIds } = useFavorites()

  // Реф для хранения предыдущих параметров (без layout)
  const prevRelevantParamsRef = useRef<string>('')

  // Debug: Log categories to see their structure
  useEffect(() => {
    if (categories && categories.length > 0) {
      logDebug('Categories in client component:', categories)
    }
  }, [categories])

  const categoriesList = categories.map((category) => {
    const categoryLabel =
      typeof category.title === 'object'
        ? category.title[currentLocale] || Object.values(category.title)[0]
        : category.title || ''

    return {
      id: category.id,
      label: categoryLabel,
      value: category.id,
    }
  })

  // Debug the categoriesList
  useEffect(() => {
    logDebug('Processed categoriesList:', categoriesList)
  }, [categoriesList])

  const productTypes = [
    { id: 'digital', label: t.filters.productType.digital, value: 'digital' },
    { id: 'subscription', label: t.filters.productType.subscription, value: 'subscription' },
    { id: 'service', label: t.filters.productType.service, value: 'service' },
    { id: 'access', label: t.filters.productType.access, value: 'access' },
  ]

  // Вычисляем реальный максимум цены из всех продуктов
  // с учетом конвертации валют
  const calculateMaxPrice = () => {
    if (!initialProducts || initialProducts.length === 0) {
      logDebug('DEBUG: Нет продуктов, возвращаем 1000')
      return 1000 // Значение по умолчанию, если продуктов нет
    }

    logDebug('DEBUG: Количество продуктов для анализа:', initialProducts.length)

    // Находим максимальную цену среди всех продуктов
    let maxPrice = 0
    initialProducts.forEach((product, index) => {
      let productPrice = 0
      logDebug(`DEBUG: Анализ продукта #${index}:`, product.title || product.id)

      // Get price using the simplified getLocalePrice function
      if (product.pricing) {
        // Check if price is localized
        if (product.pricing.price && typeof product.pricing.price === 'object') {
          productPrice = product.pricing.price[currentLocale] || product.pricing.price.en || 0
          logDebug(`DEBUG: Найдена локализованная цена для ${currentLocale}:`, productPrice)
        } else {
          // Use finalPrice if available, otherwise use price
          productPrice = product.pricing.finalPrice || product.pricing.price || 0
          logDebug(`DEBUG: Используем цену:`, productPrice)
        }
      }

      // Обновляем максимальную цену
      if (productPrice > maxPrice) {
        maxPrice = productPrice
        logDebug(`DEBUG: Новая максимальная цена:`, maxPrice)
      }
    })

    logDebug(`DEBUG: Максимальная цена до запаса и округления:`, maxPrice)

    // Добавляем 20% запас, чтобы слайдер был немного шире, чем самый дорогой товар
    maxPrice = Math.ceil(maxPrice * 1.2)
    logDebug(`DEBUG: После добавления 20% запаса:`, maxPrice)

    // Округляем до ближайшей сотни для более "красивого" отображения
    const roundedMaxPrice = Math.ceil(maxPrice / 100) * 100
    logDebug(`DEBUG: После округления до сотен:`, roundedMaxPrice)

    return roundedMaxPrice
  }

  const priceRange = { min: 0, max: calculateMaxPrice() }

  // Function to fetch products based on current search params
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      // Create the query string from current search params
      const queryString = searchParams.toString()

      const apiUrl = `/api/products?${queryString}&locale=${currentLocale}`
      logDebug('Fetching products from:', apiUrl)

      // Fetch products from API
      const response = await fetch(apiUrl)

      if (!response.ok) {
        const errorText = await response.text()
        logError('API Error:', response.status, errorText)
        throw new Error(`API error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      logDebug('API response received:', data)

      // Check if the response contains an error field
      if (data.error) {
        logError('API returned error:', data.error, data.details)
        throw new Error(data.error)
      }

      // Verify the response has the expected structure
      if (!Array.isArray(data.docs)) {
        logError('API returned unexpected data structure:', data)
        throw new Error('Invalid API response format')
      }

      // Filter favorites if needed - читаем favoriteProductIds здесь
      let filteredProducts = data.docs as Product[]
      // Получаем актуальный Set ID избранного прямо перед фильтрацией
      const currentFavoriteIds = favoriteProductIds // Доступ к переменной из замыкания
      if (searchParams.get('favorites') === 'true' && currentFavoriteIds) {
        filteredProducts = filteredProducts.filter((product: Product) => currentFavoriteIds.has(product.id))
      }

      // Update state with new products
      setDisplayProducts(filteredProducts)
      setCurrentTotalPages(data.totalPages || 1)
      setCurrentPageNum(data.page || 1)
    } catch (error) {
      logError('Error fetching products:', error)
      // Fall back to initial products on error
      setDisplayProducts(initialProducts)
      // Show some indication to user that we fell back to initial data
      setCurrentTotalPages(initialTotalPages)
      setCurrentPageNum(initialCurrentPage)
    } finally {
      setIsLoading(false)
    }
  }, [
    searchParams, // Все еще нужен доступ к searchParams внутри
    currentLocale,
    initialProducts,
    initialTotalPages,
    initialCurrentPage,
    favoriteProductIds, // Оставляем favoriteProductIds здесь, так как фильтрация происходит внутри
  ])

  // Listen for search params changes and fetch products conditionally
  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams.toString())
    currentParams.delete('layout') // Удаляем layout для сравнения
    const currentRelevantParamsString = currentParams.toString()

    // Log для отладки сравнения параметров
    logDebug('Current relevant params:', currentRelevantParamsString)
    logDebug('Previous relevant params:', prevRelevantParamsRef.current)

    // Вызываем fetchProducts только если релевантные параметры изменились
    // или если это первая загрузка (prevRelevantParamsRef.current пуст)
    if (currentRelevantParamsString !== prevRelevantParamsRef.current) {
      logDebug('Relevant params changed, fetching products...')
      fetchProducts()
      // Обновляем реф *после* вызова fetchProducts
      prevRelevantParamsRef.current = currentRelevantParamsString
    } else {
      logDebug('Relevant params did not change, skipping fetch.')
    }

    // Log the full current search params for debugging
    logDebug('Full search params changed:', Object.fromEntries(searchParams.entries()))
    // Зависимости: fetchProducts все еще нужен, т.к. он используется внутри
    // searchParams нужен, чтобы эффект срабатывал при их изменении
  }, [searchParams, fetchProducts])

  return (
    <div>
      <FilterBar
        categories={categoriesList}
        sortOptions={[
          { label: t.sortOptions.newest, value: 'newest' },
          { label: t.sortOptions.priceLowToHigh, value: 'price-asc' },
          { label: t.sortOptions.priceHighToLow, value: 'price' },
        ]}
        productTypes={productTypes}
        priceRange={priceRange}
        defaultLayout={searchParams.get('layout') === 'list' || searchParams.get('layout') === 'grid' ? searchParams.get('layout') as 'list' | 'grid' : 'grid'}
        locale={currentLocale}
        showFavorites={searchParams.get('favorites') === 'true'}
        currency={{
          code: currentLocale === 'ru' ? 'RUB' : 'USD',
          symbol: currentLocale === 'ru' ? '₽' : '$',
          position: currentLocale === 'ru' ? 'after' : 'before',
          rate: 1,
        }}
        labels={{
          categories: t.filters.categories,
          sort: t.filters.sort,
          search: t.filters.search,
          searchPlaceholder: t.filters.searchPlaceholder,
          allCategories: t.categories.all,
          productTypes: t.filters.productTypes,
          priceRange: t.filters.priceRange.label,
          layout: t.filters.layout[searchParams.get('layout') === 'list' || searchParams.get('layout') === 'grid' ? searchParams.get('layout') as 'list' | 'grid' : 'grid'],
          favorites: currentLocale === 'ru' ? 'Избранное' : 'Favorites',
        }}
      />

      {isLoading ? (
        <div className="flex justify-center my-12">
          <LoadingIndicator />
        </div>
      ) : (
        <ProductsGrid
          products={displayProducts}
          layout={searchParams.get('layout') === 'list' || searchParams.get('layout') === 'grid' ? searchParams.get('layout') as 'list' | 'grid' : 'grid'}
          locale={currentLocale}
          currentPage={currentPageNum}
          totalPages={currentTotalPages}
          labels={{
            prev: t.pagination.prev,
            next: t.pagination.next,
            page: t.pagination.page,
            of: t.pagination.of,
          }}
        />
      )}
    </div>
  )
}

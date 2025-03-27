'use client'

import { FilterBar } from '@/components/FilterBar'
import { ProductsGrid } from '@/components/ProductsGrid'
import { type Locale } from '@/constants'
import type { Category, Product } from '@/payload-types'
import { translations } from './translations'
import { useFavorites } from '@/hooks/useFavorites'
import { useState, useEffect, useCallback } from 'react'

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
  products,
  categories,
  currentLocale,
  searchParams,
  totalPages,
  currentPage,
}: ProductsClientProps) {
  const t = translations[currentLocale as keyof typeof translations]
  const { favorites, forceUpdate } = useFavorites()
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(products)
  const [isInitialized, setIsInitialized] = useState(false)

  // Форсируем обновление данных избранного при первой загрузке
  useEffect(() => {
    if (!isInitialized) {
      forceUpdate()
      setIsInitialized(true)
    }
  }, [forceUpdate, isInitialized])

  // Функция для фильтрации продуктов, вынесена отдельно чтобы можно было вызвать при необходимости
  const filterFavoriteProducts = useCallback(() => {
    if (searchParams.favorites === 'true') {
      // Проверяем, есть ли избранные товары
      if (favorites && favorites.length > 0) {
        const favoriteIds = favorites.map((fav) => fav.id)
        const filteredProducts = products.filter((product) => favoriteIds.includes(product.id))
        setDisplayedProducts(filteredProducts)
      } else {
        // Если нет избранных, показываем пустой список
        setDisplayedProducts([])
      }
    } else {
      setDisplayedProducts(products)
    }
  }, [searchParams.favorites, favorites, products])

  // Фильтрация продуктов по избранным, если параметр favorites установлен
  useEffect(() => {
    filterFavoriteProducts()
  }, [searchParams.favorites, favorites, products, filterFavoriteProducts])

  // Дополнительная проверка на случай, если избранные не загрузились сразу
  useEffect(() => {
    if (searchParams.favorites === 'true') {
      const timeoutId = setTimeout(() => {
        filterFavoriteProducts()
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [searchParams.favorites, filterFavoriteProducts])

  const categoriesList = categories.map((category) => ({
    id: category.id,
    label: typeof category.title === 'object' ? category.title[currentLocale] : category.title,
    value: category.id,
  }))

  const productTypes = [
    { id: 'digital', label: t.filters.productType.digital, value: 'digital' },
    { id: 'subscription', label: t.filters.productType.subscription, value: 'subscription' },
    { id: 'service', label: t.filters.productType.service, value: 'service' },
    { id: 'access', label: t.filters.productType.access, value: 'access' },
  ]

  const tags = [
    { id: 'new', label: 'New', value: 'new' },
    { id: 'popular', label: 'Popular', value: 'popular' },
    { id: 'featured', label: 'Featured', value: 'featured' },
  ]

  const priceRange = { min: 0, max: 1000 }

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
        tags={tags}
        priceRange={priceRange}
        defaultLayout={searchParams.layout || 'grid'}
        locale={currentLocale}
        showFavorites={searchParams.favorites === 'true'}
        labels={{
          categories: t.filters.categories,
          sort: t.filters.sort,
          search: t.filters.search,
          searchPlaceholder: t.filters.searchPlaceholder,
          allCategories: t.categories.all,
          productTypes: t.filters.productTypes,
          tags: t.filters.tags,
          priceRange: t.filters.priceRange,
          layout: t.filters.layout,
          favorites: currentLocale === 'ru' ? 'Избранное' : 'Favorites',
        }}
      />
      <ProductsGrid
        products={displayedProducts}
        layout={searchParams.layout || 'grid'}
        locale={currentLocale}
        currentPage={currentPage}
        totalPages={totalPages}
        labels={{
          prev: t.pagination.prev,
          next: t.pagination.next,
          page: t.pagination.page,
          of: t.pagination.of,
        }}
      />
    </div>
  )
}

'use client'

import { FilterBar } from '@/components/FilterBar'
import { ProductsGrid } from '@/components/ProductsGrid'
import { type Locale } from '@/constants'
import type { Category, Product } from '@/payload-types'
import { translations } from './translations'
import { useFavorites } from '@/hooks/useFavorites'
import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import LoadingIndicator from '@/components/ui/LoadingIndicator'

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

  const { favorites, forceUpdate } = useFavorites()
  const [isInitialized, setIsInitialized] = useState(false)

  // Debug: Log categories to see their structure
  useEffect(() => {
    if (categories && categories.length > 0) {
      console.log('Categories in client component:', categories)
    }
  }, [categories])

  // Update this to only handle force update of favorites data
  const filterFavoriteProducts = useCallback(() => {
    // This will now only handle initialization of favorites data
    if (!isInitialized && searchParams.get('favorites') === 'true') {
      try {
        const { loadFromStorage } = useFavorites.getState()
        loadFromStorage()
        setTimeout(() => forceUpdate(), 10)
        setIsInitialized(true)
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    }
  }, [isInitialized, searchParams, forceUpdate])

  // Keep this effect to handle favorites initialization
  useEffect(() => {
    filterFavoriteProducts()
  }, [filterFavoriteProducts])

  const categoriesList = categories.map((category) => {
    const categoryLabel =
      typeof category.title === 'object'
        ? category.title[currentLocale] || Object.values(category.title)[0]
        : category.title || category.name || ''

    return {
      id: category.id,
      label: categoryLabel,
      value: category.id,
    }
  })

  // Debug the categoriesList
  useEffect(() => {
    console.log('Processed categoriesList:', categoriesList)
  }, [categoriesList])

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

  // Function to fetch products based on current search params
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      // Create the query string from current search params
      const queryString = searchParams.toString()

      const apiUrl = `/api/v1/products?${queryString}&locale=${currentLocale}`
      console.log('Fetching products from:', apiUrl)

      // Fetch products from API
      const response = await fetch(apiUrl)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        throw new Error(`API error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('API response received:', data)

      // Check if the response contains an error field
      if (data.error) {
        console.error('API returned error:', data.error, data.details)
        throw new Error(data.error)
      }

      // Verify the response has the expected structure
      if (!Array.isArray(data.docs)) {
        console.error('API returned unexpected data structure:', data)
        throw new Error('Invalid API response format')
      }

      // Filter favorites if needed
      let filteredProducts = data.docs
      if (searchParams.get('favorites') === 'true' && favorites && favorites.length > 0) {
        const favoriteIds = favorites.map((fav) => fav.id)
        filteredProducts = data.docs.filter((product) => favoriteIds.includes(product.id))
      }

      // Update state with new products
      setDisplayProducts(filteredProducts)
      setCurrentTotalPages(data.totalPages || 1)
      setCurrentPageNum(data.page || 1)
    } catch (error) {
      console.error('Error fetching products:', error)
      // Fall back to initial products on error
      setDisplayProducts(initialProducts)
      // Show some indication to user that we fell back to initial data
      setCurrentTotalPages(initialTotalPages)
      setCurrentPageNum(initialCurrentPage)
    } finally {
      setIsLoading(false)
    }
  }, [
    searchParams,
    currentLocale,
    favorites,
    initialProducts,
    initialTotalPages,
    initialCurrentPage,
  ])

  // Listen for search params changes and fetch products
  useEffect(() => {
    // Always refetch on searchParams changes to ensure clearing filters works
    fetchProducts()

    // Log the current search params for debugging
    console.log('Search params changed:', Object.fromEntries(searchParams.entries()))
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
        tags={tags}
        priceRange={priceRange}
        defaultLayout={searchParams.get('layout') || 'grid'}
        locale={currentLocale}
        showFavorites={searchParams.get('favorites') === 'true'}
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

      {isLoading ? (
        <div className="flex justify-center my-12">
          <LoadingIndicator size="lg" />
        </div>
      ) : (
        <ProductsGrid
          products={displayProducts}
          layout={searchParams.get('layout') || 'grid'}
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
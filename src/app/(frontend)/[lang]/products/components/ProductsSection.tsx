import { ProductsGrid } from '@/blocks/ProductsGrid/Component'
import { FilterBar } from '@/components/FilterBar'
import { ProductsTranslations } from '../translations'

interface ProductsSectionProps {
  t: ProductsTranslations[keyof ProductsTranslations]
  products: any[] // Replace 'any' with your actual Product type
  categories: Array<{ label: string; value: string }>
  sortOptions: Array<{ label: string; value: string }>
  totalPages: number
  currentPage: number
  productsPerPage: number
  layout?: 'grid' | 'list'
  minPrice?: number
  maxPrice?: number
}

export function ProductsSection({
  t,
  products,
  categories,
  sortOptions,
  totalPages,
  currentPage,
  productsPerPage,
  layout = 'grid',
  minPrice = 0,
  maxPrice = 1000,
}: ProductsSectionProps) {
  return (
    <div className="flex flex-col pagination-container">
      <FilterBar
        categories={categories}
        sortOptions={sortOptions}
        defaultLayout="grid"
        minPrice={minPrice}
        maxPrice={maxPrice}
        labels={{
          categories: t.filters.categories,
          sort: t.filters.sort,
          search: t.filters.search,
          searchPlaceholder: t.filters.searchPlaceholder,
          allCategories: t.categories.all,
          layout: t.filters.layout,
          priceRange: t.filters.priceRange,
        }}
      />

      <div className="mt-8 flex-grow">
        <ProductsGrid
          products={products}
          productsPerPage={productsPerPage}
          showPagination={true}
          layout={layout}
          labels={{
            prev: t.pagination.prev,
            next: t.pagination.next,
            page: t.pagination.page,
            of: t.pagination.of,
          }}
        />
      </div>
    </div>
  )
}

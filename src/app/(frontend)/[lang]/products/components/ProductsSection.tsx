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
}

export function ProductsSection({
  t,
  products,
  categories,
  sortOptions,
  totalPages,
  currentPage,
  productsPerPage,
  layout = 'grid'
}: ProductsSectionProps) {
  return (
    <>
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
        {products.length > 0 ? (
          <ProductsGrid
            products={products}
            totalPages={totalPages}
            currentPage={currentPage}
            productsPerPage={productsPerPage}
            showPagination={true}
            layout={layout}
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
    </>
  )
}
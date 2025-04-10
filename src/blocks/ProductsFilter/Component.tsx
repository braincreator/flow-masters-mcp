"use client"
'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from '@/providers/I18n'
import { Slider } from '@/components/ui/slider'
import { ProductType } from '@/types'
import { translations } from '@/app/(frontend)/[lang]/products/translations'

export const ProductsFilter: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useI18n()
  const t = translations[lang as keyof typeof translations]
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`?${params.toString()}`)
  }

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values)
    const params = new URLSearchParams(searchParams.toString())
    params.set('minPrice', values[0].toString())
    params.set('maxPrice', values[1].toString())
    router.push(`?${params.toString()}`)
  }

  const productTypes: ProductType[] = ['digital', 'subscription', 'service', 'access']

  return (
    <div className="products-filter">
      <div className="filter-section">
        <h3>{t.filters.productType.label}</h3>
        <select 
          onChange={(e) => updateFilters('type', e.target.value)}
          value={searchParams.get('type') || 'all'}
        >
          <option value="all">{t.filters.productType.all}</option>
          {productTypes.map(type => (
            <option key={type} value={type}>
              {t.filters.productType[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <h3>{t.filters.priceRange.label}</h3>
        <PriceRangeSlider
          value={priceRange}
          onChange={handlePriceRangeChange}
          min={0}
          max={1000}
          labels={{
            min: t.filters.priceRange.min,
            max: t.filters.priceRange.max
          }}
        />
      </div>

      {/* Other filter sections */}
    </div>
  )
}

'use client'

import { Pagination as UIPagination } from '@/components/ui/pagination'
import { cn } from '@/utilities/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

export const Pagination: React.FC<{
  className?: string
  page: number
  totalPages: number
  onPageChange?: (page: number) => void
  labels?: {
    prev: string
    next: string
    page: string
    of: string
  }
  baseUrl?: string
  searchParams?: Record<string, string>
  scroll?: boolean
}> = (props) => {
  const router = useRouter()
  const searchParamsObj = useSearchParams()

  const {
    className,
    page,
    totalPages,
    onPageChange,
    labels,
    baseUrl,
    searchParams: externalSearchParams,
    scroll = false,
  } = props

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage)
    } else {
      const params = new URLSearchParams(searchParamsObj.toString())

      // Add any external search params
      if (externalSearchParams) {
        Object.entries(externalSearchParams).forEach(([key, value]) => {
          if (value) params.set(key, value)
        })
      }

      params.set('page', newPage.toString())

      if (baseUrl) {
        router.push(`${baseUrl}?${params.toString()}`, { scroll })
      } else {
        router.push(`?${params.toString()}`, { scroll })
      }
    }
  }

  // If only one page, don't show pagination
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={cn('py-3 w-full', className)}>
      <div className="container">
        <UIPagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </div>
  )
}

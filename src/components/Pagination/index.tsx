'use client'
import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
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
}> = (props) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { className, page, totalPages, onPageChange, labels } = props
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  const hasExtraPrevPages = page - 1 > 1
  const hasExtraNextPages = page + 1 < totalPages

  const updatePage = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage)
    } else {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', newPage.toString())
      router.push(`?${params.toString()}`)
    }
  }

  return (
    <div className={cn('my-12', className)}>
      <PaginationComponent>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious disabled={!hasPrevPage} onClick={() => updatePage(page - 1)}>
              {labels?.prev || 'Previous'}
            </PaginationPrevious>
          </PaginationItem>

          {hasExtraPrevPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {hasPrevPage && (
            <PaginationItem>
              <PaginationLink onClick={() => updatePage(page - 1)}>{page - 1}</PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationLink isActive onClick={() => updatePage(page)}>
              {page}
            </PaginationLink>
          </PaginationItem>

          {hasNextPage && (
            <PaginationItem>
              <PaginationLink onClick={() => updatePage(page + 1)}>{page + 1}</PaginationLink>
            </PaginationItem>
          )}

          {hasExtraNextPages && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext disabled={!hasNextPage} onClick={() => updatePage(page + 1)}>
              {labels?.next || 'Next'}
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </PaginationComponent>
    </div>
  )
}

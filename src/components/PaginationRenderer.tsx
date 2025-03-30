'use client'

import React, { useEffect, useState, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Pagination } from '@/components/Pagination'

interface PaginationRendererProps {
  children?: ReactNode
}

export default function PaginationRenderer({ children }: PaginationRendererProps) {
  const [mounted, setMounted] = useState(false)
  const [paginationSlot, setPaginationSlot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setMounted(true)
    setPaginationSlot(document.getElementById('pagination-slot'))

    return () => {
      setMounted(false)
    }
  }, [])

  // Если компонент не смонтирован, возвращаем дочерний контент напрямую
  if (!mounted) {
    return <div className="pagination-fallback">{children}</div>
  }

  // Если не переданы дети, создаем дефолтную пагинацию
  const paginationContent = children || <Pagination page={1} totalPages={1} />

  // Если слот для пагинации не найден, отображаем контент напрямую
  if (!paginationSlot) {
    return <>{paginationContent}</>
  }

  // Создаем портал и рендерим пагинацию в слот
  return createPortal(paginationContent, paginationSlot)
}

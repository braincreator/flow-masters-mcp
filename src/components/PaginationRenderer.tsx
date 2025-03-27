'use client'

import React, { useEffect, useState, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Pagination } from '@/components/Pagination'

interface PaginationRendererProps {
  children?: ReactNode
}

export default function PaginationRenderer({ children }: PaginationRendererProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log('PaginationRenderer mounted')
    return () => {
      setMounted(false)
    }
  }, [])

  // Если компонент не смонтирован, возвращаем null
  if (!mounted) {
    console.log('PaginationRenderer not mounted yet')
    return null
  }

  // Если не переданы дети, создаем дефолтную пагинацию
  const paginationContent = children || <Pagination page={1} totalPages={1} />

  // Находим слот для пагинации
  const paginationSlot = document.getElementById('pagination-slot')

  if (!paginationSlot) {
    console.log('Pagination slot not found!')
    return <>{paginationContent}</>
  }

  console.log('Pagination slot found, rendering pagination')

  // Создаем портал и рендерим пагинацию в слот
  return createPortal(paginationContent, paginationSlot)
}

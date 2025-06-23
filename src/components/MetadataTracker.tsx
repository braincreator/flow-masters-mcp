'use client'

import { useEffect } from 'react'
import { initializeMetadataTracking } from '@/utilities/formMetadata'

/**
 * Компонент для инициализации отслеживания метаданных
 * Должен быть размещен в корневом layout или на каждой странице
 */
export function MetadataTracker() {
  useEffect(() => {
    // Инициализируем отслеживание метаданных при загрузке страницы
    initializeMetadataTracking()
  }, [])

  // Компонент не рендерит ничего видимого
  return null
}

export default MetadataTracker

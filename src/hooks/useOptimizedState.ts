'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useSafeTimeout } from './useSafeContext'

/**
 * Оптимизированный хук состояния с дебаунсом и управлением памятью
 */
export function useOptimizedState<T>(
  initialValue: T,
  options: {
    debounceMs?: number
    maxHistorySize?: number
    enableHistory?: boolean
  } = {}
) {
  const { debounceMs = 0, maxHistorySize = 10, enableHistory = false } = options
  
  const [value, setValue] = useState<T>(initialValue)
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue)
  const history = useRef<T[]>(enableHistory ? [initialValue] : [])
  const { safeSetTimeout } = useSafeTimeout()
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Дебаунсированное обновление
  const updateDebouncedValue = useCallback((newValue: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (debounceMs > 0) {
      timeoutRef.current = safeSetTimeout(() => {
        setDebouncedValue(newValue)
      }, debounceMs)
    } else {
      setDebouncedValue(newValue)
    }
  }, [debounceMs, safeSetTimeout])

  // Оптимизированная функция обновления состояния
  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const nextValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue
      
      // Добавляем в историю только если включена
      if (enableHistory) {
        history.current.push(nextValue)
        
        // Ограничиваем размер истории для экономии памяти
        if (history.current.length > maxHistorySize) {
          history.current = history.current.slice(-maxHistorySize)
        }
      }
      
      updateDebouncedValue(nextValue)
      return nextValue
    })
  }, [enableHistory, maxHistorySize, updateDebouncedValue])

  // Функция для отката к предыдущему значению
  const undo = useCallback(() => {
    if (!enableHistory || history.current.length < 2) return false
    
    history.current.pop() // Удаляем текущее значение
    const previousValue = history.current[history.current.length - 1]
    
    if (previousValue !== undefined) {
      setValue(previousValue)
      updateDebouncedValue(previousValue)
      return true
    }
    
    return false
  }, [enableHistory, updateDebouncedValue])

  // Очистка истории для освобождения памяти
  const clearHistory = useCallback(() => {
    if (enableHistory) {
      history.current = [value]
    }
  }, [enableHistory, value])

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    value,
    debouncedValue,
    setValue: updateValue,
    undo,
    clearHistory,
    hasHistory: enableHistory && history.current.length > 1,
    historySize: enableHistory ? history.current.length : 0,
  }
}

/**
 * Хук для управления списками с оптимизацией памяти
 */
export function useOptimizedList<T>(
  initialItems: T[] = [],
  options: {
    maxSize?: number
    enableVirtualization?: boolean
    itemHeight?: number
  } = {}
) {
  const { maxSize = 1000, enableVirtualization = false, itemHeight = 50 } = options
  
  const [items, setItems] = useState<T[]>(initialItems)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 })
  
  // Добавление элемента с проверкой лимита
  const addItem = useCallback((item: T) => {
    setItems(prev => {
      const newItems = [...prev, item]
      
      // Ограничиваем размер списка для экономии памяти
      if (newItems.length > maxSize) {
        return newItems.slice(-maxSize)
      }
      
      return newItems
    })
  }, [maxSize])

  // Добавление нескольких элементов
  const addItems = useCallback((newItems: T[]) => {
    setItems(prev => {
      const combined = [...prev, ...newItems]
      
      if (combined.length > maxSize) {
        return combined.slice(-maxSize)
      }
      
      return combined
    })
  }, [maxSize])

  // Удаление элемента по индексу
  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Обновление элемента по индексу
  const updateItem = useCallback((index: number, updater: T | ((item: T) => T)) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        return typeof updater === 'function' ? (updater as (item: T) => T)(item) : updater
      }
      return item
    }))
  }, [])

  // Очистка списка
  const clearItems = useCallback(() => {
    setItems([])
  }, [])

  // Обновление видимого диапазона для виртуализации
  const updateVisibleRange = useCallback((scrollTop: number, containerHeight: number) => {
    if (!enableVirtualization) return
    
    const start = Math.floor(scrollTop / itemHeight)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = Math.min(start + visibleCount + 5, items.length) // +5 для буфера
    
    setVisibleRange({ start: Math.max(0, start - 5), end })
  }, [enableVirtualization, itemHeight, items.length])

  // Получение видимых элементов для виртуализации
  const visibleItems = enableVirtualization 
    ? items.slice(visibleRange.start, visibleRange.end)
    : items

  return {
    items,
    visibleItems,
    visibleRange,
    addItem,
    addItems,
    removeItem,
    updateItem,
    clearItems,
    updateVisibleRange,
    totalHeight: enableVirtualization ? items.length * itemHeight : undefined,
    itemCount: items.length,
  }
}

/**
 * Хук для кэширования вычислений с управлением памятью
 */
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: {
    maxCacheSize?: number
    ttl?: number
  } = {}
) {
  const { maxCacheSize = 50, ttl = 5 * 60 * 1000 } = options // 5 минут TTL
  
  const cache = useRef<Map<string, { value: T; timestamp: number }>>(new Map())
  const { safeSetTimeout } = useSafeTimeout()

  // Создаем ключ кэша из зависимостей
  const cacheKey = JSON.stringify(deps)

  // Очистка устаревших записей
  const cleanupCache = useCallback(() => {
    const now = Date.now()
    const entries = Array.from(cache.current.entries())
    
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > ttl) {
        cache.current.delete(key)
      }
    })

    // Ограничиваем размер кэша
    if (cache.current.size > maxCacheSize) {
      const sortedEntries = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, cache.current.size - maxCacheSize)
      
      sortedEntries.forEach(([key]) => {
        cache.current.delete(key)
      })
    }
  }, [ttl, maxCacheSize])

  // Получаем или вычисляем значение
  const getValue = useCallback(() => {
    const cached = cache.current.get(cacheKey)
    const now = Date.now()

    // Проверяем актуальность кэша
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.value
    }

    // Вычисляем новое значение
    const newValue = factory()
    cache.current.set(cacheKey, { value: newValue, timestamp: now })

    // Планируем очистку кэша
    safeSetTimeout(cleanupCache, ttl)

    return newValue
  }, [cacheKey, factory, ttl, cleanupCache, safeSetTimeout])

  return getValue()
}

export default useOptimizedState

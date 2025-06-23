'use client'

import { useEffect, useRef } from 'react'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Хук для безопасного использования AbortController в React компонентах
 * Автоматически отменяет контроллер при размонтировании компонента
 *
 * @returns Объект с AbortController и его signal
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController>()

  // Создаем новый AbortController при первом рендере
  if (!controllerRef.current) {
    controllerRef.current = new AbortController()

    // Добавляем проверку на существование transformAlgorithm для исправления ошибки
    try {
      const controller = controllerRef.current as any
      if (
        controller[Symbol.for('kState')] &&
        typeof controller[Symbol.for('kState')].transformAlgorithm !== 'function'
      ) {
        controller[Symbol.for('kState')].transformAlgorithm = () => {}
      }
    } catch (error) {
      // Игнорируем ошибки при попытке исправить transformAlgorithm
      logDebug('Could not fix transformAlgorithm:', error)
    }
  }

  // Отменяем контроллер при размонтировании
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort()
      }
    }
  }, [])

  return {
    controller: controllerRef.current,
    signal: controllerRef.current.signal,
  }
}

/**
 * Хук для безопасного добавления обработчиков событий с автоматической отменой
 *
 * @param element Элемент, к которому добавляется обработчик (или функция, возвращающая элемент)
 * @param eventType Тип события
 * @param handler Обработчик события
 * @param options Опции addEventListener
 */
export function useEventListener<K extends keyof WindowEventMap>(
  element: Window | null | (() => Window | null),
  eventType: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): void

export function useEventListener<K extends keyof DocumentEventMap>(
  element: Document | null | (() => Document | null),
  eventType: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): void

export function useEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | null | (() => HTMLElement | null),
  eventType: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): void

export function useEventListener(
  element: any | null | (() => any | null),
  eventType: string,
  handler: (event: any) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  // Используем useRef для хранения обработчика
  const savedHandler = useRef<(event: any) => void>()
  const { signal } = useAbortController()

  // Обновляем ref.current при изменении обработчика
  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    // Получаем элемент (если это функция)
    const targetElement = typeof element === 'function' ? element() : element

    if (!targetElement || !savedHandler.current) return

    // Создаем обработчик, который вызывает сохраненную функцию
    const eventListener = (event: any) => savedHandler.current!(event)

    // Добавляем обработчик с signal для автоматической отмены
    const listenerOptions = { ...(options || {}), signal }
    targetElement.addEventListener(eventType, eventListener, listenerOptions)

    // Очистка не требуется благодаря использованию AbortSignal
  }, [element, eventType, options, signal])
}

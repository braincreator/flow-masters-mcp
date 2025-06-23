'use client'

import type { FormInteraction } from '@/types/formMetadata'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Ключи для хранения данных
const STORAGE_KEYS = {
  FORM_INTERACTIONS: 'fm_form_interactions',
  SCROLL_TRACKING: 'fm_scroll_tracking',
  TIME_TRACKING: 'fm_time_tracking',
  MOUSE_TRACKING: 'fm_mouse_tracking',
} as const

// Интерфейсы для отслеживания
interface TimeTrackingData {
  page_enter_time: number
  total_time: number
  active_time: number
  idle_time: number
  last_activity: number
}

interface ScrollTrackingData {
  max_scroll: number
  scroll_events: number
  time_to_scroll: number
  scroll_speed: number
}

interface MouseTrackingData {
  clicks: number
  movements: number
  hover_time: number
  last_movement: number
}

/**
 * Класс для отслеживания взаимодействий пользователя
 */
export class UserTracker {
  private timeData: TimeTrackingData
  private scrollData: ScrollTrackingData
  private mouseData: MouseTrackingData
  private formInteractions: Map<string, FormInteraction[]>
  private isActive: boolean = true
  private idleTimer: NodeJS.Timeout | null = null
  private readonly IDLE_TIMEOUT = 30000 // 30 секунд

  constructor() {
    this.timeData = this.loadTimeData()
    this.scrollData = this.loadScrollData()
    this.mouseData = this.loadMouseData()
    this.formInteractions = this.loadFormInteractions()

    if (typeof window !== 'undefined') {
      this.initializeTracking()
    }
  }

  /**
   * Инициализирует отслеживание
   */
  private initializeTracking(): void {
    // Отслеживание времени
    this.startTimeTracking()

    // Отслеживание скролла
    this.initializeScrollTracking()

    // Отслеживание мыши
    this.initializeMouseTracking()

    // Отслеживание активности
    this.initializeActivityTracking()

    // Сохранение данных при закрытии страницы
    window.addEventListener('beforeunload', () => {
      this.saveAllData()
    })

    // Сохранение данных периодически
    setInterval(() => {
      this.saveAllData()
    }, 10000) // Каждые 10 секунд
  }

  /**
   * Начинает отслеживание времени
   */
  private startTimeTracking(): void {
    this.timeData.page_enter_time = Date.now()
    this.timeData.last_activity = Date.now()
  }

  /**
   * Инициализирует отслеживание скролла
   */
  private initializeScrollTracking(): void {
    let lastScrollTime = Date.now()
    let scrollStartTime = 0

    window.addEventListener('scroll', () => {
      const now = Date.now()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollPercent = Math.round((scrollTop + windowHeight) / documentHeight * 100)

      // Обновляем максимальный скролл
      if (scrollPercent > this.scrollData.max_scroll) {
        this.scrollData.max_scroll = scrollPercent
      }

      // Считаем события скролла
      this.scrollData.scroll_events++

      // Время до первого скролла
      if (this.scrollData.time_to_scroll === 0 && scrollTop > 100) {
        this.scrollData.time_to_scroll = now - this.timeData.page_enter_time
      }

      // Скорость скролла
      if (scrollStartTime === 0) {
        scrollStartTime = now
      }
      
      const timeDiff = now - lastScrollTime
      if (timeDiff > 100) { // Обновляем не чаще чем раз в 100мс
        const scrollDiff = Math.abs(scrollTop - (this.scrollData.max_scroll * documentHeight / 100))
        this.scrollData.scroll_speed = scrollDiff / timeDiff
        lastScrollTime = now
      }

      this.updateActivity()
    })
  }

  /**
   * Инициализирует отслеживание мыши
   */
  private initializeMouseTracking(): void {
    let lastMoveTime = Date.now()

    // Движения мыши
    document.addEventListener('mousemove', () => {
      const now = Date.now()
      if (now - lastMoveTime > 100) { // Дебаунс 100мс
        this.mouseData.movements++
        this.mouseData.last_movement = now
        lastMoveTime = now
        this.updateActivity()
      }
    })

    // Клики
    document.addEventListener('click', () => {
      this.mouseData.clicks++
      this.updateActivity()
    })

    // Время наведения (hover)
    let hoverStartTime = 0
    document.addEventListener('mouseenter', () => {
      hoverStartTime = Date.now()
    })

    document.addEventListener('mouseleave', () => {
      if (hoverStartTime > 0) {
        this.mouseData.hover_time += Date.now() - hoverStartTime
        hoverStartTime = 0
      }
    })
  }

  /**
   * Инициализирует отслеживание активности
   */
  private initializeActivityTracking(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    events.forEach(event => {
      document.addEventListener(event, () => {
        this.updateActivity()
      }, true)
    })

    // Отслеживание фокуса/потери фокуса
    window.addEventListener('focus', () => {
      this.isActive = true
      this.updateActivity()
    })

    window.addEventListener('blur', () => {
      this.isActive = false
      this.updateIdleTime()
    })
  }

  /**
   * Обновляет активность пользователя
   */
  private updateActivity(): void {
    const now = Date.now()
    
    if (this.isActive) {
      this.timeData.active_time += now - this.timeData.last_activity
    } else {
      this.timeData.idle_time += now - this.timeData.last_activity
    }

    this.timeData.last_activity = now
    this.isActive = true

    // Сбрасываем таймер бездействия
    if (this.idleTimer) {
      clearTimeout(this.idleTimer)
    }

    this.idleTimer = setTimeout(() => {
      this.isActive = false
      this.updateIdleTime()
    }, this.IDLE_TIMEOUT)
  }

  /**
   * Обновляет время бездействия
   */
  private updateIdleTime(): void {
    const now = Date.now()
    this.timeData.idle_time += now - this.timeData.last_activity
    this.timeData.last_activity = now
  }

  /**
   * Отслеживает взаимодействие с формой
   */
  public trackFormInteraction(
    formId: string,
    fieldName: string,
    action: FormInteraction['action'],
    value?: any,
    errorMessage?: string
  ): void {
    const interaction: FormInteraction = {
      field_name: fieldName,
      action,
      timestamp: new Date().toISOString(),
      value_length: typeof value === 'string' ? value.length : undefined,
      error_message: errorMessage,
    }

    if (!this.formInteractions.has(formId)) {
      this.formInteractions.set(formId, [])
    }

    this.formInteractions.get(formId)!.push(interaction)
    this.updateActivity()
  }

  /**
   * Получает взаимодействия с формой
   */
  public getFormInteractions(formId: string): FormInteraction[] {
    return this.formInteractions.get(formId) || []
  }

  /**
   * Получает все данные отслеживания
   */
  public getTrackingData() {
    const now = Date.now()
    
    // Обновляем общее время
    this.timeData.total_time = now - this.timeData.page_enter_time

    return {
      time: this.timeData,
      scroll: this.scrollData,
      mouse: this.mouseData,
      formInteractions: Object.fromEntries(this.formInteractions),
    }
  }

  /**
   * Сохраняет все данные
   */
  private saveAllData(): void {
    if (typeof window === 'undefined') return

    try {
      sessionStorage.setItem(STORAGE_KEYS.TIME_TRACKING, JSON.stringify(this.timeData))
      sessionStorage.setItem(STORAGE_KEYS.SCROLL_TRACKING, JSON.stringify(this.scrollData))
      sessionStorage.setItem(STORAGE_KEYS.MOUSE_TRACKING, JSON.stringify(this.mouseData))
      sessionStorage.setItem(STORAGE_KEYS.FORM_INTERACTIONS, JSON.stringify(Object.fromEntries(this.formInteractions)))
    } catch (error) {
      logWarn('Error saving tracking data:', error)
    }
  }

  /**
   * Загружает данные времени
   */
  private loadTimeData(): TimeTrackingData {
    if (typeof window === 'undefined') {
      return {
        page_enter_time: Date.now(),
        total_time: 0,
        active_time: 0,
        idle_time: 0,
        last_activity: Date.now(),
      }
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEYS.TIME_TRACKING)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      logWarn('Error loading time data:', error)
    }

    return {
      page_enter_time: Date.now(),
      total_time: 0,
      active_time: 0,
      idle_time: 0,
      last_activity: Date.now(),
    }
  }

  /**
   * Загружает данные скролла
   */
  private loadScrollData(): ScrollTrackingData {
    if (typeof window === 'undefined') {
      return {
        max_scroll: 0,
        scroll_events: 0,
        time_to_scroll: 0,
        scroll_speed: 0,
      }
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEYS.SCROLL_TRACKING)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      logWarn('Error loading scroll data:', error)
    }

    return {
      max_scroll: 0,
      scroll_events: 0,
      time_to_scroll: 0,
      scroll_speed: 0,
    }
  }

  /**
   * Загружает данные мыши
   */
  private loadMouseData(): MouseTrackingData {
    if (typeof window === 'undefined') {
      return {
        clicks: 0,
        movements: 0,
        hover_time: 0,
        last_movement: Date.now(),
      }
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEYS.MOUSE_TRACKING)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      logWarn('Error loading mouse data:', error)
    }

    return {
      clicks: 0,
      movements: 0,
      hover_time: 0,
      last_movement: Date.now(),
    }
  }

  /**
   * Загружает взаимодействия с формами
   */
  private loadFormInteractions(): Map<string, FormInteraction[]> {
    if (typeof window === 'undefined') {
      return new Map()
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEYS.FORM_INTERACTIONS)
      if (stored) {
        const data = JSON.parse(stored)
        return new Map(Object.entries(data))
      }
    } catch (error) {
      logWarn('Error loading form interactions:', error)
    }

    return new Map()
  }
}

// Глобальный экземпляр трекера
let globalTracker: UserTracker | null = null

/**
 * Получает глобальный экземпляр трекера
 */
export function getUserTracker(): UserTracker {
  if (!globalTracker) {
    globalTracker = new UserTracker()
  }
  return globalTracker
}

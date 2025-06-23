'use client'

import type {
  FormMetadata,
  UTMData,
  TrafficSource,
  DeviceInfo,
  LocationInfo,
  UserBehavior,
  SessionInfo,
  MarketingData,
  TechnicalMetadata,
  FormContext,
  MetadataCollectionConfig,
  StoredUserData,
  TouchPoint,
} from '@/types/formMetadata'

// Конфигурация по умолчанию
const DEFAULT_CONFIG: MetadataCollectionConfig = {
  collect_utm: true,
  collect_device_info: true,
  collect_location: false, // Требует разрешения пользователя
  collect_behavior: true,
  collect_technical: true,
  collect_marketing: true,
  anonymize_ip: true,
  collect_fingerprint: false, // Может вызывать проблемы с приватностью
  respect_dnt: true,
  debounce_interactions: 300,
  max_touchpoints: 50,
  max_pages_tracked: 100,
}

// Ключи для localStorage/sessionStorage
const STORAGE_KEYS = {
  SESSION_DATA: 'fm_session_data',
  USER_BEHAVIOR: 'fm_user_behavior',
  UTM_DATA: 'fm_utm_data',
  TOUCHPOINTS: 'fm_touchpoints',
} as const

/**
 * Генерирует уникальный ID сессии
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Получает или создает ID сессии
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId()
  
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.SESSION_DATA)
    if (stored) {
      const data: StoredUserData = JSON.parse(stored)
      return data.session_id
    }
  } catch (error) {
    console.warn('Error reading session data:', error)
  }
  
  const sessionId = generateSessionId()
  initializeSession(sessionId)
  return sessionId
}

/**
 * Инициализирует новую сессию
 */
function initializeSession(sessionId: string): void {
  if (typeof window === 'undefined') return
  
  const sessionData: StoredUserData = {
    session_id: sessionId,
    session_start: new Date().toISOString(),
    pages_visited: [window.location.pathname],
    utm_data: extractUTMData(),
    landing_page: window.location.href,
    touchpoints: [],
    form_interactions: {},
  }
  
  try {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(sessionData))
  } catch (error) {
    console.warn('Error saving session data:', error)
  }
}

/**
 * Извлекает UTM-параметры из URL
 */
export function extractUTMData(url?: string): UTMData {
  if (typeof window === 'undefined' && !url) return {}
  
  const searchParams = new URLSearchParams(
    url ? new URL(url).search : window.location.search
  )
  
  return {
    utm_source: searchParams.get('utm_source') || undefined,
    utm_medium: searchParams.get('utm_medium') || undefined,
    utm_campaign: searchParams.get('utm_campaign') || undefined,
    utm_term: searchParams.get('utm_term') || undefined,
    utm_content: searchParams.get('utm_content') || undefined,
    gclid: searchParams.get('gclid') || undefined,
    fbclid: searchParams.get('fbclid') || undefined,
    yclid: searchParams.get('yclid') || undefined,
    msclkid: searchParams.get('msclkid') || undefined,
  }
}

/**
 * Получает информацию об источнике трафика
 */
export function getTrafficSource(): TrafficSource {
  if (typeof window === 'undefined') {
    return { current_page: '' }
  }
  
  const sessionData = getStoredSessionData()
  
  return {
    referrer: document.referrer || undefined,
    landing_page: sessionData?.landing_page,
    current_page: window.location.href,
    previous_page: getPreviousPage(),
    session_entry_page: sessionData?.landing_page,
    organic_keyword: extractOrganicKeyword(),
    search_engine: detectSearchEngine(),
  }
}

/**
 * Определяет поисковую систему из referrer
 */
function detectSearchEngine(): string | undefined {
  if (typeof window === 'undefined' || !document.referrer) return undefined
  
  const referrer = document.referrer.toLowerCase()
  
  if (referrer.includes('google.')) return 'Google'
  if (referrer.includes('yandex.')) return 'Yandex'
  if (referrer.includes('bing.')) return 'Bing'
  if (referrer.includes('yahoo.')) return 'Yahoo'
  if (referrer.includes('duckduckgo.')) return 'DuckDuckGo'
  if (referrer.includes('mail.ru')) return 'Mail.ru'
  
  return undefined
}

/**
 * Извлекает ключевое слово из органического поиска
 */
function extractOrganicKeyword(): string | undefined {
  if (typeof window === 'undefined' || !document.referrer) return undefined
  
  try {
    const referrerUrl = new URL(document.referrer)
    return referrerUrl.searchParams.get('q') || 
           referrerUrl.searchParams.get('query') || 
           referrerUrl.searchParams.get('text') || 
           undefined
  } catch {
    return undefined
  }
}

/**
 * Получает информацию об устройстве и браузере
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      user_agent: '',
      language: 'en',
      timezone: 'UTC',
    }
  }
  
  const nav = navigator
  const screen = window.screen
  
  return {
    user_agent: nav.userAgent,
    browser_name: getBrowserName(),
    browser_version: getBrowserVersion(),
    os_name: getOSName(),
    os_version: getOSVersion(),
    device_type: getDeviceType(),
    device_vendor: nav.vendor || undefined,
    screen_resolution: `${screen.width}x${screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    color_depth: screen.colorDepth,
    pixel_ratio: window.devicePixelRatio,
    touch_support: 'ontouchstart' in window,
    language: nav.language,
    languages: nav.languages ? Array.from(nav.languages) : undefined,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezone_offset: new Date().getTimezoneOffset(),
    connection_type: getConnectionType(),
  }
}

/**
 * Определяет тип устройства
 */
function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop'
  
  const userAgent = navigator.userAgent.toLowerCase()
  
  if (/tablet|ipad|playbook|silk/.test(userAgent)) {
    return 'tablet'
  }
  
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) {
    return 'mobile'
  }
  
  return 'desktop'
}

/**
 * Получает название браузера
 */
function getBrowserName(): string | undefined {
  if (typeof window === 'undefined') return undefined
  
  const userAgent = navigator.userAgent
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari'
  if (userAgent.includes('Edg')) return 'Edge'
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera'
  if (userAgent.includes('YaBrowser')) return 'Yandex Browser'
  
  return undefined
}

/**
 * Получает версию браузера
 */
function getBrowserVersion(): string | undefined {
  if (typeof window === 'undefined') return undefined
  
  const userAgent = navigator.userAgent
  const browserName = getBrowserName()
  
  if (!browserName) return undefined
  
  const versionRegex = new RegExp(`${browserName}[/\\s]([\\d.]+)`, 'i')
  const match = userAgent.match(versionRegex)
  
  return match ? match[1] : undefined
}

/**
 * Получает название операционной системы
 */
function getOSName(): string | undefined {
  if (typeof window === 'undefined') return undefined
  
  const userAgent = navigator.userAgent
  
  if (userAgent.includes('Windows')) return 'Windows'
  if (userAgent.includes('Mac OS')) return 'macOS'
  if (userAgent.includes('Linux')) return 'Linux'
  if (userAgent.includes('Android')) return 'Android'
  if (userAgent.includes('iOS')) return 'iOS'
  
  return undefined
}

/**
 * Получает версию операционной системы
 */
function getOSVersion(): string | undefined {
  if (typeof window === 'undefined') return undefined
  
  const userAgent = navigator.userAgent
  
  // Windows
  if (userAgent.includes('Windows NT 10.0')) return '10'
  if (userAgent.includes('Windows NT 6.3')) return '8.1'
  if (userAgent.includes('Windows NT 6.2')) return '8'
  if (userAgent.includes('Windows NT 6.1')) return '7'
  
  // macOS
  const macMatch = userAgent.match(/Mac OS X ([0-9_]+)/)
  if (macMatch) return macMatch[1].replace(/_/g, '.')
  
  // Android
  const androidMatch = userAgent.match(/Android ([0-9.]+)/)
  if (androidMatch) return androidMatch[1]
  
  // iOS
  const iosMatch = userAgent.match(/OS ([0-9_]+)/)
  if (iosMatch) return iosMatch[1].replace(/_/g, '.')
  
  return undefined
}

/**
 * Получает тип соединения
 */
function getConnectionType(): string | undefined {
  if (typeof window === 'undefined') return undefined
  
  // @ts-ignore - экспериментальное API
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  
  return connection?.effectiveType || undefined
}

/**
 * Получает сохраненные данные сессии
 */
function getStoredSessionData(): StoredUserData | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.SESSION_DATA)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

/**
 * Получает предыдущую страницу из истории сессии
 */
function getPreviousPage(): string | undefined {
  const sessionData = getStoredSessionData()
  const pages = sessionData?.pages_visited || []
  return pages.length > 1 ? pages[pages.length - 2] : undefined
}

/**
 * Обновляет список посещенных страниц
 */
export function trackPageVisit(page?: string): void {
  if (typeof window === 'undefined') return

  const currentPage = page || window.location.pathname
  const sessionData = getStoredSessionData()

  if (!sessionData) {
    initializeSession(generateSessionId())
    return
  }

  // Добавляем страницу, если она отличается от последней
  const lastPage = sessionData.pages_visited[sessionData.pages_visited.length - 1]
  if (lastPage !== currentPage) {
    sessionData.pages_visited.push(currentPage)

    // Ограничиваем количество отслеживаемых страниц
    if (sessionData.pages_visited.length > DEFAULT_CONFIG.max_pages_tracked) {
      sessionData.pages_visited = sessionData.pages_visited.slice(-DEFAULT_CONFIG.max_pages_tracked)
    }

    try {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(sessionData))
    } catch (error) {
      console.warn('Error updating session data:', error)
    }
  }
}

/**
 * Получает поведенческие данные пользователя
 */
export function getUserBehavior(): UserBehavior {
  const sessionData = getStoredSessionData()
  const sessionId = getSessionId()

  if (typeof window === 'undefined') {
    return {
      session_id: sessionId,
      session_start_time: new Date().toISOString(),
      pages_visited: [],
    }
  }

  const sessionStartTime = sessionData?.session_start || new Date().toISOString()
  const now = Date.now()
  const sessionStart = new Date(sessionStartTime).getTime()

  return {
    session_id: sessionId,
    session_start_time: sessionStartTime,
    time_on_site: Math.round((now - sessionStart) / 1000),
    pages_visited: sessionData?.pages_visited || [],
    page_views_count: sessionData?.pages_visited.length || 1,
    is_returning_visitor: isReturningVisitor(),
    previous_visit_date: getPreviousVisitDate(),
    visit_count: getVisitCount(),
    scroll_depth: getCurrentScrollDepth(),
    max_scroll_depth: getMaxScrollDepth(),
  }
}

/**
 * Проверяет, является ли пользователь возвращающимся
 */
function isReturningVisitor(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const visitCount = localStorage.getItem('fm_visit_count')
    return visitCount ? parseInt(visitCount) > 1 : false
  } catch {
    return false
  }
}

/**
 * Получает дату предыдущего визита
 */
function getPreviousVisitDate(): string | undefined {
  if (typeof window === 'undefined') return undefined

  try {
    return localStorage.getItem('fm_last_visit') || undefined
  } catch {
    return undefined
  }
}

/**
 * Получает количество визитов
 */
function getVisitCount(): number {
  if (typeof window === 'undefined') return 1

  try {
    const count = localStorage.getItem('fm_visit_count')
    return count ? parseInt(count) : 1
  } catch {
    return 1
  }
}

/**
 * Получает текущую глубину прокрутки
 */
function getCurrentScrollDepth(): number {
  if (typeof window === 'undefined') return 0

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  return Math.round((scrollTop + windowHeight) / documentHeight * 100)
}

/**
 * Получает максимальную глубину прокрутки за сессию
 */
function getMaxScrollDepth(): number {
  if (typeof window === 'undefined') return 0

  try {
    const stored = sessionStorage.getItem('fm_max_scroll')
    const current = getCurrentScrollDepth()
    const max = stored ? Math.max(parseInt(stored), current) : current

    sessionStorage.setItem('fm_max_scroll', max.toString())
    return max
  } catch {
    return getCurrentScrollDepth()
  }
}

/**
 * Получает информацию о сессии и аутентификации
 */
export function getSessionInfo(): SessionInfo {
  if (typeof window === 'undefined') {
    return { is_authenticated: false }
  }

  // Попытка получить информацию о пользователе из различных источников
  const userInfo = getUserFromStorage() || getUserFromCookies()

  return {
    is_authenticated: !!userInfo,
    user_id: userInfo?.id,
    user_email: userInfo?.email,
    user_role: userInfo?.role,
    registration_date: userInfo?.createdAt,
    last_login: userInfo?.lastLogin,
  }
}

/**
 * Получает информацию о пользователе из localStorage
 */
function getUserFromStorage(): any {
  if (typeof window === 'undefined') return null

  try {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

/**
 * Получает информацию о пользователе из cookies
 */
function getUserFromCookies(): any {
  if (typeof window === 'undefined') return null

  try {
    // Ищем JWT токен в cookies
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('payload-token='))
      ?.split('=')[1]

    if (token) {
      // Декодируем JWT (только payload, без верификации)
      const payload = token.split('.')[1]
      if (payload) {
        const decoded = JSON.parse(atob(payload))
        return decoded
      }
    }
  } catch {
    // Игнорируем ошибки декодирования
  }

  return null
}

/**
 * Получает технические метаданные
 */
export function getTechnicalMetadata(): TechnicalMetadata {
  if (typeof window === 'undefined') {
    return {
      javascript_enabled: true,
      cookies_enabled: false,
      local_storage_enabled: false,
    }
  }

  return {
    page_load_time: getPageLoadTime(),
    javascript_enabled: true, // Если код выполняется, значит JS включен
    cookies_enabled: navigator.cookieEnabled,
    local_storage_enabled: isLocalStorageEnabled(),
    ad_blocker_detected: isAdBlockerDetected(),
    bot_detected: isBotDetected(),
  }
}

/**
 * Получает время загрузки страницы
 */
function getPageLoadTime(): number | undefined {
  if (typeof window === 'undefined' || !window.performance) return undefined

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (navigation) {
    return Math.round(navigation.loadEventEnd - navigation.fetchStart)
  }

  return undefined
}

/**
 * Проверяет доступность localStorage
 */
function isLocalStorageEnabled(): boolean {
  try {
    const test = '__test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Определяет наличие блокировщика рекламы
 */
function isAdBlockerDetected(): boolean {
  if (typeof window === 'undefined') return false

  // Простая проверка на блокировщик рекламы
  try {
    const adElement = document.createElement('div')
    adElement.innerHTML = '&nbsp;'
    adElement.className = 'adsbox'
    adElement.style.position = 'absolute'
    adElement.style.left = '-10000px'
    document.body.appendChild(adElement)

    const isBlocked = adElement.offsetHeight === 0
    document.body.removeChild(adElement)

    return isBlocked
  } catch {
    return false
  }
}

/**
 * Определяет, является ли посетитель ботом
 */
function isBotDetected(): boolean {
  if (typeof window === 'undefined') return false

  const userAgent = navigator.userAgent.toLowerCase()
  const botPatterns = [
    'bot', 'crawler', 'spider', 'crawling', 'facebook', 'google',
    'baidu', 'bing', 'msn', 'duckduckbot', 'teoma', 'slurp',
    'yandex', 'headless', 'phantom', 'selenium'
  ]

  return botPatterns.some(pattern => userAgent.includes(pattern))
}

/**
 * Обновляет счетчики визитов
 */
export function updateVisitCounters(): void {
  if (typeof window === 'undefined') return

  try {
    // Обновляем дату последнего визита
    const now = new Date().toISOString()
    const lastVisit = localStorage.getItem('fm_last_visit')

    if (lastVisit) {
      const lastVisitDate = new Date(lastVisit)
      const daysDiff = Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))

      // Считаем новым визитом, если прошло больше 30 минут
      if (daysDiff > 0 || (Date.now() - lastVisitDate.getTime()) > 30 * 60 * 1000) {
        const visitCount = getVisitCount()
        localStorage.setItem('fm_visit_count', (visitCount + 1).toString())
      }
    } else {
      // Первый визит
      localStorage.setItem('fm_visit_count', '1')
    }

    localStorage.setItem('fm_last_visit', now)
  } catch (error) {
    console.warn('Error updating visit counters:', error)
  }
}

/**
 * Создает полные метаданные формы
 */
export function createFormMetadata(
  formContext: FormContext,
  config: Partial<MetadataCollectionConfig> = {}
): FormMetadata {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  // Проверяем Do Not Track
  if (finalConfig.respect_dnt && typeof window !== 'undefined') {
    // @ts-ignore
    const dnt = navigator.doNotTrack || navigator.msDoNotTrack || window.doNotTrack
    if (dnt === '1' || dnt === 'yes') {
      // Ограничиваем сбор данных при включенном DNT
      finalConfig.collect_location = false
      finalConfig.collect_fingerprint = false
      finalConfig.anonymize_ip = true
    }
  }

  const metadata: FormMetadata = {
    timestamp: new Date().toISOString(),
    form_context: formContext,
    utm_data: finalConfig.collect_utm ? extractUTMData() : {},
    traffic_source: getTrafficSource(),
    device_info: finalConfig.collect_device_info ? getDeviceInfo() : {
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
      language: typeof window !== 'undefined' ? navigator.language : 'en',
      timezone: typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
    },
    user_behavior: finalConfig.collect_behavior ? getUserBehavior() : {
      session_id: getSessionId(),
      session_start_time: new Date().toISOString(),
      pages_visited: [],
    },
    session_info: getSessionInfo(),
    technical_metadata: finalConfig.collect_technical ? getTechnicalMetadata() : {
      javascript_enabled: true,
      cookies_enabled: typeof window !== 'undefined' ? navigator.cookieEnabled : false,
      local_storage_enabled: isLocalStorageEnabled(),
    },
  }

  // Добавляем геолокацию, если разрешено
  if (finalConfig.collect_location) {
    // Геолокация будет добавлена асинхронно через отдельную функцию
    metadata.location_info = {}
  }

  // Добавляем маркетинговые данные
  if (finalConfig.collect_marketing) {
    metadata.marketing_data = getMarketingData()
  }

  return metadata
}

/**
 * Получает маркетинговые данные
 */
function getMarketingData(): MarketingData {
  const sessionData = getStoredSessionData()
  const touchpoints = sessionData?.touchpoints || []

  return {
    touchpoints,
    attribution_model: 'last_click', // Можно настроить
    conversion_path: sessionData?.pages_visited || [],
  }
}

/**
 * Добавляет точку касания в маркетинговый путь
 */
export function addTouchPoint(source: string, medium: string, campaign?: string): void {
  if (typeof window === 'undefined') return

  const sessionData = getStoredSessionData()
  if (!sessionData) return

  const touchPoint: TouchPoint = {
    source,
    medium,
    campaign,
    timestamp: new Date().toISOString(),
    page: window.location.href,
  }

  sessionData.touchpoints = sessionData.touchpoints || []
  sessionData.touchpoints.push(touchPoint)

  // Ограничиваем количество точек касания
  if (sessionData.touchpoints.length > DEFAULT_CONFIG.max_touchpoints) {
    sessionData.touchpoints = sessionData.touchpoints.slice(-DEFAULT_CONFIG.max_touchpoints)
  }

  try {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(sessionData))
  } catch (error) {
    console.warn('Error saving touchpoint:', error)
  }
}

/**
 * Получает геолокацию пользователя (асинхронно)
 */
export async function getLocationInfo(): Promise<LocationInfo | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return null
  }

  return new Promise((resolve) => {
    const options = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 300000, // 5 минут
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => {
        // Ошибка или отказ пользователя
        resolve(null)
      },
      options
    )
  })
}

/**
 * Инициализирует отслеживание метаданных
 */
export function initializeMetadataTracking(): void {
  if (typeof window === 'undefined') return

  // Обновляем счетчики визитов
  updateVisitCounters()

  // Отслеживаем текущую страницу
  trackPageVisit()

  // Добавляем точку касания, если есть UTM-метки
  const utmData = extractUTMData()
  if (utmData.utm_source && utmData.utm_medium) {
    addTouchPoint(utmData.utm_source, utmData.utm_medium, utmData.utm_campaign)
  }

  // Отслеживаем изменения в истории браузера
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  history.pushState = function(...args) {
    originalPushState.apply(history, args)
    setTimeout(() => trackPageVisit(), 0)
  }

  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args)
    setTimeout(() => trackPageVisit(), 0)
  }

  // Отслеживаем события popstate
  window.addEventListener('popstate', () => {
    setTimeout(() => trackPageVisit(), 0)
  })
}

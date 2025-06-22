/**
 * Типы для максимального сбора метаданных форм
 */

// UTM и источники трафика
export interface UTMData {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  gclid?: string // Google Ads
  fbclid?: string // Facebook Ads
  yclid?: string // Yandex Direct
  msclkid?: string // Microsoft Ads
}

// Информация о referrer и источниках
export interface TrafficSource {
  referrer?: string
  landing_page?: string
  current_page: string
  previous_page?: string
  session_entry_page?: string
  organic_keyword?: string
  search_engine?: string
}

// Техническая информация о браузере и устройстве
export interface DeviceInfo {
  user_agent: string
  browser_name?: string
  browser_version?: string
  os_name?: string
  os_version?: string
  device_type?: 'desktop' | 'mobile' | 'tablet'
  device_vendor?: string
  device_model?: string
  screen_resolution?: string
  viewport_size?: string
  color_depth?: number
  pixel_ratio?: number
  touch_support?: boolean
  language: string
  languages?: string[]
  timezone: string
  timezone_offset?: number
  connection_type?: string
  connection_speed?: string
}

// Геолокация и IP информация
export interface LocationInfo {
  ip_address?: string
  country?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
  isp?: string
  organization?: string
  timezone_from_ip?: string
}

// Поведенческие данные пользователя
export interface UserBehavior {
  session_id: string
  session_start_time: string
  time_on_page?: number
  time_on_site?: number
  scroll_depth?: number
  max_scroll_depth?: number
  pages_visited: string[]
  page_views_count?: number
  is_returning_visitor?: boolean
  previous_visit_date?: string
  visit_count?: number
  bounce_rate?: number
  engagement_score?: number
  mouse_movements?: number
  clicks_count?: number
  form_interactions?: FormInteraction[]
}

// Взаимодействие с формой
export interface FormInteraction {
  field_name: string
  action: 'focus' | 'blur' | 'change' | 'error'
  timestamp: string
  value_length?: number
  time_spent?: number
  error_message?: string
}

// Контекст формы
export interface FormContext {
  form_id?: string
  form_type: string
  form_name?: string
  form_location: string // компонент/страница где находится форма
  form_trigger?: string // что вызвало показ формы
  modal_context?: boolean
  ab_test_variant?: string
  form_version?: string
  submission_attempt?: number
  auto_filled_fields?: string[]
  validation_errors?: string[]
}

// Данные о сессии и аутентификации
export interface SessionInfo {
  is_authenticated: boolean
  user_id?: string
  user_role?: string
  user_email?: string
  registration_date?: string
  last_login?: string
  subscription_status?: string
  customer_segment?: string
  lifetime_value?: number
  previous_orders_count?: number
}

// Маркетинговые данные
export interface MarketingData {
  campaign_id?: string
  ad_group_id?: string
  keyword?: string
  placement?: string
  creative_id?: string
  audience_id?: string
  experiment_id?: string
  variant_id?: string
  attribution_model?: string
  conversion_path?: string[]
  touchpoints?: TouchPoint[]
}

export interface TouchPoint {
  source: string
  medium: string
  campaign?: string
  timestamp: string
  page: string
}

// Технические метаданные
export interface TechnicalMetadata {
  form_load_time?: number
  page_load_time?: number
  network_speed?: string
  javascript_enabled: boolean
  cookies_enabled: boolean
  local_storage_enabled: boolean
  ad_blocker_detected?: boolean
  bot_detected?: boolean
  fraud_score?: number
  fingerprint?: string
}

// Полная структура метаданных формы
export interface FormMetadata {
  // Основные данные
  timestamp: string
  form_context: FormContext
  
  // Источники трафика
  utm_data: UTMData
  traffic_source: TrafficSource
  
  // Техническая информация
  device_info: DeviceInfo
  location_info?: LocationInfo
  
  // Поведенческие данные
  user_behavior: UserBehavior
  
  // Сессия и пользователь
  session_info: SessionInfo
  
  // Маркетинг
  marketing_data?: MarketingData
  
  // Технические метаданные
  technical_metadata: TechnicalMetadata
  
  // Дополнительные данные
  custom_data?: Record<string, any>
}

// Данные отправки формы
export interface FormSubmissionData {
  field: string
  value: any
  type?: string
  label?: string
  required?: boolean
  validation_passed?: boolean
}

// Полная структура отправки формы с метаданными
export interface EnhancedFormSubmission {
  // Основные данные формы
  form_id?: string
  submission_data: FormSubmissionData[]
  
  // Метаданные
  metadata: FormMetadata
  
  // Статус отправки
  submission_status: 'success' | 'error' | 'pending'
  error_message?: string
  
  // Время отправки
  submitted_at: string
  processed_at?: string
}

// Конфигурация сбора метаданных
export interface MetadataCollectionConfig {
  collect_utm: boolean
  collect_device_info: boolean
  collect_location: boolean
  collect_behavior: boolean
  collect_technical: boolean
  collect_marketing: boolean
  
  // Настройки приватности
  anonymize_ip: boolean
  collect_fingerprint: boolean
  respect_dnt: boolean // Do Not Track
  
  // Настройки производительности
  debounce_interactions: number
  max_touchpoints: number
  max_pages_tracked: number
}

// Типы для хранения в localStorage/sessionStorage
export interface StoredUserData {
  session_id: string
  session_start: string
  pages_visited: string[]
  utm_data?: UTMData
  landing_page?: string
  touchpoints: TouchPoint[]
  form_interactions: Record<string, FormInteraction[]>
}

'use client'

import React from 'react'
import { usePixelEvents } from '@/hooks/usePixelEvents'

interface TrackableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  trackEvent?: string
  trackData?: Record<string, any>
  conversionType?: 'lead' | 'purchase' | 'registration' | 'contact'
  conversionValue?: number
  children: React.ReactNode
}

/**
 * Кнопка с автоматическим отслеживанием событий
 */
export function TrackableButton({
  trackEvent = 'button_click',
  trackData = {},
  conversionType,
  conversionValue,
  onClick,
  children,
  ...props
}: TrackableButtonProps) {
  const { trackEvent: sendEvent, trackLead, trackPurchase, trackRegistration, trackContact } = usePixelEvents()

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // Вызываем оригинальный обработчик
    if (onClick) {
      onClick(event)
    }

    // Отслеживаем клик
    await sendEvent(trackEvent, {
      button_text: typeof children === 'string' ? children : 'Button',
      button_id: props.id || '',
      ...trackData,
    })

    // Отслеживаем конверсию если указана
    if (conversionType && conversionValue) {
      switch (conversionType) {
        case 'lead':
          await trackLead({ value: conversionValue })
          break
        case 'purchase':
          await trackPurchase({ value: conversionValue, currency: 'RUB' })
          break
        case 'registration':
          await trackRegistration()
          break
        case 'contact':
          await trackContact()
          break
      }
    }
  }

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  )
}

interface TrackableLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  trackEvent?: string
  trackData?: Record<string, any>
  children: React.ReactNode
}

/**
 * Ссылка с автоматическим отслеживанием событий
 */
export function TrackableLink({
  trackEvent = 'link_click',
  trackData = {},
  onClick,
  href,
  children,
  ...props
}: TrackableLinkProps) {
  const { trackEvent: sendEvent } = usePixelEvents()

  const handleClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Вызываем оригинальный обработчик
    if (onClick) {
      onClick(event)
    }

    // Определяем тип ссылки
    let linkType = 'internal'
    if (href) {
      if (href.startsWith('tel:')) linkType = 'phone'
      else if (href.startsWith('mailto:')) linkType = 'email'
      else if (href.startsWith('http') && !href.includes(window.location.hostname)) linkType = 'external'
    }

    // Отслеживаем клик
    await sendEvent(trackEvent, {
      link_text: typeof children === 'string' ? children : 'Link',
      link_url: href || '',
      link_type: linkType,
      ...trackData,
    })
  }

  return (
    <a {...props} href={href} onClick={handleClick}>
      {children}
    </a>
  )
}

interface TrackableFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  trackEvent?: string
  trackData?: Record<string, any>
  conversionType?: 'lead' | 'registration' | 'contact'
  conversionValue?: number
  formName?: string
  children: React.ReactNode
}

/**
 * Форма с автоматическим отслеживанием отправки
 */
export function TrackableForm({
  trackEvent = 'form_submit',
  trackData = {},
  conversionType = 'lead',
  conversionValue = 0,
  formName = 'Contact Form',
  onSubmit,
  children,
  ...props
}: TrackableFormProps) {
  const { trackEvent: sendEvent, trackLead, trackRegistration, trackContact } = usePixelEvents()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Вызываем оригинальный обработчик
    if (onSubmit) {
      onSubmit(event)
    }

    // Небольшая задержка для обработки формы
    setTimeout(async () => {
      // Отслеживаем отправку формы
      await sendEvent(trackEvent, {
        form_name: formName,
        form_id: props.id || '',
        value: conversionValue,
        currency: 'RUB',
        ...trackData,
      })

      // Отслеживаем конверсию
      switch (conversionType) {
        case 'lead':
          await trackLead({ 
            value: conversionValue,
            content_name: formName 
          })
          break
        case 'registration':
          await trackRegistration({ 
            method: 'form',
            content_name: formName 
          })
          break
        case 'contact':
          await trackContact({ 
            content_name: formName 
          })
          break
      }
    }, 100)
  }

  return (
    <form {...props} onSubmit={handleSubmit}>
      {children}
    </form>
  )
}

/**
 * HOC для добавления отслеживания к любому компоненту
 */
export function withTracking<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  trackingConfig: {
    event?: string
    data?: Record<string, any>
    trigger?: 'click' | 'hover' | 'focus'
  }
) {
  return function TrackedComponent(props: T) {
    const { trackEvent } = usePixelEvents()
    const { event = 'component_interaction', data = {}, trigger = 'click' } = trackingConfig

    const handleInteraction = async () => {
      await trackEvent(event, {
        component: WrappedComponent.name || 'Unknown',
        ...data,
      })
    }

    const eventProps = {
      [trigger === 'click' ? 'onClick' : trigger === 'hover' ? 'onMouseEnter' : 'onFocus']: handleInteraction
    }

    return <WrappedComponent {...props} {...eventProps} />
  }
}

/**
 * Компонент для отслеживания видимости элемента
 */
export function VisibilityTracker({
  children,
  trackEvent = 'element_visible',
  trackData = {},
  threshold = 0.5,
}: {
  children: React.ReactNode
  trackEvent?: string
  trackData?: Record<string, any>
  threshold?: number
}) {
  const { trackEvent: sendEvent } = usePixelEvents()
  const [hasTracked, setHasTracked] = React.useState(false)
  const elementRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!elementRef.current || hasTracked) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTracked) {
          setHasTracked(true)
          sendEvent(trackEvent, {
            element_id: elementRef.current?.id || '',
            element_class: elementRef.current?.className || '',
            ...trackData,
          })
        }
      },
      { threshold }
    )

    observer.observe(elementRef.current)

    return () => observer.disconnect()
  }, [trackEvent, trackData, threshold, hasTracked, sendEvent])

  return (
    <div ref={elementRef}>
      {children}
    </div>
  )
}

/**
 * Простые компоненты для быстрого использования
 */
export const CTAButton = (props: TrackableButtonProps) => (
  <TrackableButton 
    {...props} 
    trackEvent="cta_click"
    trackData={{ cta_type: 'primary', ...props.trackData }}
  />
)

export const BuyButton = (props: TrackableButtonProps) => (
  <TrackableButton 
    {...props} 
    trackEvent="purchase_intent"
    conversionType="purchase"
    trackData={{ button_type: 'buy', ...props.trackData }}
  />
)

export const ContactButton = (props: TrackableButtonProps) => (
  <TrackableButton 
    {...props} 
    trackEvent="contact_intent"
    conversionType="contact"
    trackData={{ button_type: 'contact', ...props.trackData }}
  />
)

export const LeadForm = (props: TrackableFormProps) => (
  <TrackableForm 
    {...props} 
    trackEvent="lead_form_submit"
    conversionType="lead"
    formName={props.formName || 'Lead Form'}
  />
)

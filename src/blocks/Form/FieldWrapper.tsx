'use client'

import React, { useContext, createContext } from 'react'

// Контекст для передачи функций отслеживания в поля формы
interface FormTrackingContextType {
  handleFormStart: () => void
  handleFieldInteraction: (
    fieldName: string,
    action: 'focus' | 'blur' | 'change' | 'error',
    value?: any,
    errorMessage?: string
  ) => void
}

export const FormTrackingContext = createContext<FormTrackingContextType | null>(null)

// Хук для использования контекста отслеживания
export function useFormTracking() {
  const context = useContext(FormTrackingContext)
  return context
}

// Компонент-обертка для полей формы
interface FieldWrapperProps {
  children: React.ReactNode
  fieldName: string
  className?: string
}

export function FieldWrapper({ children, fieldName, className }: FieldWrapperProps) {
  const tracking = useFormTracking()

  const handleFocus = () => {
    if (tracking) {
      tracking.handleFormStart()
      tracking.handleFieldInteraction(fieldName, 'focus')
    }
  }

  const handleBlur = (value?: any) => {
    if (tracking) {
      tracking.handleFieldInteraction(fieldName, 'blur', value)
    }
  }

  const handleChange = (value?: any) => {
    if (tracking) {
      tracking.handleFieldInteraction(fieldName, 'change', value)
    }
  }

  const handleError = (errorMessage?: string) => {
    if (tracking) {
      tracking.handleFieldInteraction(fieldName, 'error', undefined, errorMessage)
    }
  }

  // Клонируем дочерние элементы и добавляем обработчики событий
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Проверяем, является ли элемент полем ввода
      if (
        child.type === 'input' ||
        child.type === 'textarea' ||
        child.type === 'select' ||
        (typeof child.type === 'string' && ['input', 'textarea', 'select'].includes(child.type))
      ) {
        return React.cloneElement(child as React.ReactElement<any>, {
          onFocus: (e: React.FocusEvent) => {
            handleFocus()
            if (child.props.onFocus) {
              child.props.onFocus(e)
            }
          },
          onBlur: (e: React.FocusEvent) => {
            const value = (e.target as HTMLInputElement).value
            handleBlur(value)
            if (child.props.onBlur) {
              child.props.onBlur(e)
            }
          },
          onChange: (e: React.ChangeEvent) => {
            const value = (e.target as HTMLInputElement).value
            handleChange(value)
            if (child.props.onChange) {
              child.props.onChange(e)
            }
          },
        })
      }
    }
    return child
  })

  return (
    <div className={className}>
      {enhancedChildren}
    </div>
  )
}

// HOC для обертывания существующих компонентов полей
export function withFieldTracking<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  fieldName?: string
) {
  return function TrackedField(props: T & { name?: string }) {
    const name = fieldName || (props as any).name || 'unknown'
    
    return (
      <FieldWrapper fieldName={name}>
        <WrappedComponent {...props} />
      </FieldWrapper>
    )
  }
}

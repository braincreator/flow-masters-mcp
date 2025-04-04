'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Ошибка рендеринга компонента:', error)
    console.error('Информация о компоненте:', errorInfo)
    
    // Здесь можно добавить отправку ошибки в сервис аналитики
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Пример отправки в аналитику (закомментировано)
      // reportError(error, errorInfo);
    }
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

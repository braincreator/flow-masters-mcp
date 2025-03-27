/**
 * Простой логгер для приложения, безопасный для использования в серверном и клиентском режиме
 */

// Возможные уровни логирования
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// Определяем текущий уровень логирования
const getCurrentLogLevel = (): LogLevel => {
  // В разработке показываем все логи
  if (process.env.NODE_ENV === 'development') {
    return 'debug'
  }

  // В тестовом окружении показываем информационные логи и выше
  if (process.env.NODE_ENV === 'test') {
    return 'info'
  }

  // В продакшне только предупреждения и ошибки
  return 'warn'
}

// Числовое ранжирование для уровней логирования
const logLevelRank: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// Базовый логгер с поддержкой уровней
const createLogger = () => {
  const currentLevel = getCurrentLogLevel()

  const shouldLog = (level: LogLevel): boolean => {
    return logLevelRank[level] >= logLevelRank[currentLevel]
  }

  return {
    debug: (...args: any[]) => {
      if (shouldLog('debug')) {
        console.debug('[DEBUG]', ...args)
      }
    },

    info: (...args: any[]) => {
      if (shouldLog('info')) {
        console.info('[INFO]', ...args)
      }
    },

    warn: (...args: any[]) => {
      if (shouldLog('warn')) {
        console.warn('[WARN]', ...args)
      }
    },

    error: (...args: any[]) => {
      if (shouldLog('error')) {
        console.error('[ERROR]', ...args)
      }
    },

    // Специальный метод для критических ошибок, который всегда показывается
    critical: (...args: any[]) => {
      console.error('[CRITICAL]', ...args)

      // В продакшне можно подключить внешние системы логирования
      if (process.env.NODE_ENV === 'production') {
        // Здесь может быть код для отправки в Sentry, LogRocket и т.д.
      }
    },
  }
}

export const logger = createLogger()

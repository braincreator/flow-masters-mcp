# 🔄 SSR и аналитика: Полное руководство

## 📋 Обзор

Server-Side Rendering (SSR) может вызывать проблемы с аналитическими скриптами. Это руководство объясняет, как правильно обрабатывать SSR для аналитики.

## 🚨 **Основные проблемы SSR с аналитикой**

### **1. Доступ к window объекту**
```javascript
// ❌ НЕПРАВИЛЬНО - вызовет ошибку на сервере
if (window.ym) {
  window.ym(12345, 'hit', '/page')
}

// ✅ ПРАВИЛЬНО - проверка на существование
if (typeof window !== 'undefined' && window.ym) {
  window.ym(12345, 'hit', '/page')
}
```

### **2. Переменные окружения в клиентском коде**
```javascript
// ❌ НЕПРАВИЛЬНО - может не работать в SSR
const pixelId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID

// ✅ ПРАВИЛЬНО - использование хука
const env = useClientEnv()
const pixelId = env.NEXT_PUBLIC_YANDEX_METRIKA_ID
```

### **3. Гидратация и рассинхронизация**
```javascript
// ❌ НЕПРАВИЛЬНО - разное содержимое на сервере и клиенте
const [isLoaded, setIsLoaded] = useState(!!window.ym)

// ✅ ПРАВИЛЬНО - одинаковое начальное состояние
const [isLoaded, setIsLoaded] = useState(false)
const isClient = useIsClient()
```

## 🛠️ **Решения, реализованные в проекте**

### **1. Хук useIsClient**
```typescript
// src/hooks/useIsClient.ts
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}
```

**Использование:**
```typescript
const isClient = useIsClient()

if (!isClient) {
  return null // Не рендерим на сервере
}
```

### **2. Хук useWindow**
```typescript
export function useWindow() {
  const isClient = useIsClient()
  return isClient ? window : undefined
}
```

**Использование:**
```typescript
const windowObj = useWindow()

if (windowObj?.ym) {
  windowObj.ym(12345, 'hit', '/page')
}
```

### **3. Хук useClientEnv**
```typescript
export function useClientEnv() {
  const isClient = useIsClient()
  
  if (!isClient) {
    return {
      NEXT_PUBLIC_YANDEX_METRIKA_ID: undefined,
      // ... другие переменные
    }
  }

  return {
    NEXT_PUBLIC_YANDEX_METRIKA_ID: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID,
    // ... другие переменные
  }
}
```

## 🔧 **Паттерны для SSR-safe компонентов**

### **1. Условный рендеринг**
```typescript
function AnalyticsComponent() {
  const isClient = useIsClient()
  
  // Не рендерим на сервере
  if (!isClient) {
    return null
  }
  
  return <AnalyticsScript />
}
```

### **2. Отложенная инициализация**
```typescript
function PixelManager() {
  const [pixels, setPixels] = useState<Pixel[]>([])
  const isClient = useIsClient()
  
  useEffect(() => {
    if (isClient) {
      // Загружаем пиксели только на клиенте
      loadPixels()
    }
  }, [isClient])
  
  return isClient ? <PixelRenderer pixels={pixels} /> : null
}
```

### **3. Безопасная проверка объектов**
```typescript
const checkAnalyticsHealth = (windowObj?: Window) => {
  if (!windowObj) {
    return { yandexMetrika: false, vkPixel: false }
  }
  
  return {
    yandexMetrika: !!(windowObj as any).ym,
    vkPixel: !!(windowObj as any).VK
  }
}
```

## 📊 **Компоненты, исправленные для SSR**

### **1. PixelManager**
```typescript
export default function PixelManager({ ... }: PixelManagerProps) {
  const isClient = useIsClient()
  const windowObj = useWindow()
  const env = useClientEnv()
  
  // Не рендерим на сервере
  if (!isClient) {
    return null
  }
  
  // Остальная логика...
}
```

### **2. AnalyticsLayout**
```typescript
const AnalyticsLayout = memo(function AnalyticsLayout({ children }) {
  const isClient = useIsClient()
  const env = useClientEnv()
  
  const shouldLoadPixels = useMemo(() => {
    // Не загружаем на сервере
    if (!isClient) return false
    
    // Остальная логика...
  }, [isClient, ...])
  
  return (
    <>
      {children}
      {shouldLoadPixels && <PixelManager />}
    </>
  )
})
```

### **3. DOMInjectionTest**
```typescript
export function DOMInjectionTest() {
  const isClient = useIsClient()
  
  const runTest = () => {
    if (!isClient) {
      return // Не запускаем на сервере
    }
    
    // DOM тесты только на клиенте
    const scriptTags = document.querySelectorAll('script')
    // ...
  }
  
  if (!isClient) {
    return null
  }
  
  // Остальной рендер...
}
```

## 🎯 **Лучшие практики**

### **1. Всегда проверяйте isClient**
```typescript
// ✅ ПРАВИЛЬНО
const isClient = useIsClient()
if (!isClient) return null

// ❌ НЕПРАВИЛЬНО
if (typeof window === 'undefined') return null
```

### **2. Используйте useEffect для клиентской логики**
```typescript
// ✅ ПРАВИЛЬНО
useEffect(() => {
  if (isClient) {
    // Клиентская логика
    initializeAnalytics()
  }
}, [isClient])

// ❌ НЕПРАВИЛЬНО
if (isClient) {
  initializeAnalytics() // Может вызываться при каждом рендере
}
```

### **3. Мемоизируйте вычисления**
```typescript
// ✅ ПРАВИЛЬНО
const shouldLoadPixels = useMemo(() => {
  if (!isClient) return false
  return hasConsent && hasAnalytics
}, [isClient, hasConsent, hasAnalytics])

// ❌ НЕПРАВИЛЬНО
const shouldLoadPixels = !isClient ? false : hasConsent && hasAnalytics
```

### **4. Обрабатывайте состояние загрузки**
```typescript
// ✅ ПРАВИЛЬНО
if (!isClient) {
  return null // Или skeleton
}

if (loading) {
  return <LoadingSpinner />
}

// ❌ НЕПРАВИЛЬНО
if (loading || !isClient) {
  return <LoadingSpinner /> // Показывает спиннер на сервере
}
```

## 🔍 **Отладка SSR проблем**

### **1. Проверка в браузере**
```javascript
// В DevTools Console
console.log('Is client:', typeof window !== 'undefined')
console.log('Analytics objects:', {
  ym: typeof window.ym,
  VK: typeof window.VK,
  gtag: typeof window.gtag
})
```

### **2. Логирование состояний**
```typescript
useEffect(() => {
  console.log('Component mounted on client:', {
    isClient,
    hasWindow: !!windowObj,
    hasAnalytics: !!windowObj?.ym
  })
}, [isClient, windowObj])
```

### **3. Проверка гидратации**
```typescript
useEffect(() => {
  // Этот код выполнится только после гидратации
  console.log('Component hydrated')
}, [])
```

## ⚠️ **Частые ошибки**

### **1. Прямое обращение к window**
```typescript
// ❌ ОШИБКА
const hasAnalytics = !!window.ym

// ✅ ИСПРАВЛЕНИЕ
const windowObj = useWindow()
const hasAnalytics = !!windowObj?.ym
```

### **2. Использование process.env в клиентском коде**
```typescript
// ❌ ОШИБКА
const forceMode = process.env.NEXT_PUBLIC_FORCE_LOAD_PIXELS === 'true'

// ✅ ИСПРАВЛЕНИЕ
const env = useClientEnv()
const forceMode = env.NEXT_PUBLIC_FORCE_LOAD_PIXELS === 'true'
```

### **3. Разное содержимое на сервере и клиенте**
```typescript
// ❌ ОШИБКА
const [count, setCount] = useState(window.ym ? 1 : 0)

// ✅ ИСПРАВЛЕНИЕ
const [count, setCount] = useState(0)
const isClient = useIsClient()

useEffect(() => {
  if (isClient && window.ym) {
    setCount(1)
  }
}, [isClient])
```

## 🚀 **Результаты исправлений**

После внедрения SSR-safe подходов:

- ✅ **Нет ошибок гидратации** - одинаковое содержимое на сервере и клиенте
- ✅ **Корректная работа аналитики** - скрипты загружаются только на клиенте
- ✅ **Отсутствие ошибок window** - безопасный доступ к браузерным API
- ✅ **Правильная последовательность** - инициализация после гидратации
- ✅ **Стабильная работа** - нет случайных сбоев из-за SSR

## 📚 **Дополнительные ресурсы**

- [Next.js SSR Documentation](https://nextjs.org/docs/basic-features/pages#server-side-rendering)
- [React Hydration Guide](https://react.dev/reference/react-dom/client/hydrateRoot)
- [SSR Best Practices](https://web.dev/rendering-on-the-web/)

## 🎉 **Заключение**

Правильная обработка SSR критически важна для стабильной работы аналитики. Используйте предоставленные хуки и паттерны для избежания проблем с гидратацией и обеспечения корректной работы во всех сценариях.

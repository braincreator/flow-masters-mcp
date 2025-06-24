# Modern Analytics Library

A modern, type-safe analytics library for Next.js 15 App Directory with support for Yandex Metrica and VK Ads Pixel.

## Features

- 🚀 **Next.js 15 App Directory** - Native support for the latest Next.js features
- 🔒 **TypeScript** - Full type safety with comprehensive definitions
- 🎣 **React Hooks** - Modern React patterns for easy integration
- 🔄 **Auto Page Tracking** - Automatic page view tracking for App Router
- 🛠️ **Debug Mode** - Built-in debugging tools for development
- 🎯 **Multiple Services** - Unified interface for Yandex Metrica and VK Ads Pixel
- ⚡ **Performance** - Optimized loading and error handling
- 🔧 **SSR Safe** - Proper server-side rendering support

## Quick Start

### 1. Setup Provider

```tsx
// app/layout.tsx
import { AnalyticsProvider, createAnalyticsConfigFromEnv } from '@/lib/analytics'

export default function RootLayout({ children }) {
  const config = createAnalyticsConfigFromEnv()
  
  return (
    <AnalyticsProvider config={config}>
      {children}
    </AnalyticsProvider>
  )
}
```

### 2. Environment Variables

```env
NEXT_PUBLIC_YANDEX_METRIKA_ID=your_counter_id
NEXT_PUBLIC_VK_PIXEL_ID=your_pixel_id
```

### 3. Use in Components

```tsx
import { useAnalytics } from '@/lib/analytics'

function MyComponent() {
  const { trackEvent, trackGoal } = useAnalytics()
  
  const handleClick = () => {
    trackEvent('button_click', { button: 'cta' })
    trackGoal('conversion', { source: 'homepage' })
  }
  
  return <button onClick={handleClick}>Click me</button>
}
```

## Hooks

### Main Hook

```tsx
import { useAnalytics } from '@/lib/analytics'

const analytics = useAnalytics()

// Universal methods (work with all services)
analytics.trackEvent('event_name', { param: 'value' })
analytics.trackGoal('goal_name', { param: 'value' })
analytics.trackPageView('/page', 'Page Title')
analytics.identifyUser('user_id', { email: 'user@example.com' })

// Service-specific methods
analytics.ymGoal('yandex_goal')
analytics.vkEvent('vk_event')

// Debug and health
analytics.getHealth()
analytics.getRecentEvents()
```

### Specialized Hooks

```tsx
import { 
  useYandexMetrica, 
  useVKPixel, 
  useEventTracking,
  useEcommerceTracking 
} from '@/lib/analytics'

// Yandex Metrica specific
const ym = useYandexMetrica()
ym.hit('/custom-page')
ym.goal('conversion')
ym.ecommerce({ action: 'purchase', items: [...] })

// VK Pixel specific
const vk = useVKPixel()
vk.event('custom_event')
vk.goal('conversion')

// Event tracking
const { trackEvent, trackGoal } = useEventTracking()

// Ecommerce tracking
const { trackPurchase, trackAddToCart } = useEcommerceTracking()
```

## Configuration

### Basic Configuration

```tsx
import { createAnalyticsConfig } from '@/lib/analytics'

const config = createAnalyticsConfig({
  yandexMetricaId: 'your_counter_id',
  vkPixelId: 'your_pixel_id',
  debug: process.env.NODE_ENV === 'development',
  enabled: true
})
```

### Advanced Configuration

```tsx
import { AnalyticsConfig } from '@/lib/analytics'

const config: AnalyticsConfig = {
  yandexMetrica: {
    counterId: 'your_counter_id',
    options: {
      clickmap: true,
      trackLinks: true,
      webvisor: true,
      accurateTrackBounce: true,
      defer: false
    },
    enabled: true
  },
  vkPixel: [
    {
      pixelId: 'pixel_1',
      enabled: true,
      trackPageView: true
    },
    {
      pixelId: 'pixel_2', 
      enabled: true,
      trackPageView: false
    }
  ],
  debug: true,
  enabled: true
}
```

## Ecommerce Tracking

```tsx
import { useEcommerceTracking } from '@/lib/analytics'

const { trackPurchase, trackAddToCart, trackViewItem } = useEcommerceTracking()

// Track purchase
trackPurchase([
  {
    id: 'product-123',
    name: 'Product Name',
    category: 'Category',
    price: 100,
    quantity: 1,
    brand: 'Brand'
  }
], 'transaction-id', 100)

// Track add to cart
trackAddToCart([
  {
    id: 'product-456',
    name: 'Another Product',
    price: 50,
    quantity: 2
  }
])
```

## Debug Mode

In development, the library provides a debug panel that shows:

- Service health status
- Recent events log
- Test buttons for each service
- Real-time event monitoring

### Enable Debug Panel

```tsx
import { AnalyticsDebugPanel } from '@/components/analytics/AnalyticsDebugPanel'

// Add to your layout (only shows in debug mode)
<AnalyticsDebugPanel />
```

### Debug Hook

```tsx
import { useAnalyticsDebug } from '@/lib/analytics'

const { getHealth, getRecentEvents, clearEvents } = useAnalyticsDebug()

// Check service health
const health = getHealth()
console.log('Services ready:', health.yandexMetrica.loaded, health.vkPixel.loaded)

// View recent events
const events = getRecentEvents()
console.log('Recent events:', events)
```

## Error Handling

```tsx
import { AnalyticsError } from '@/lib/analytics'

try {
  analytics.trackEvent('test')
} catch (error) {
  if (error instanceof AnalyticsError) {
    console.error(`Analytics error in ${error.service}:`, error.message)
  }
}
```

## TypeScript Support

The library provides comprehensive TypeScript definitions:

```tsx
import type { 
  AnalyticsConfig,
  YandexMetricaEcommerce,
  AnalyticsEvent,
  AnalyticsHealth 
} from '@/lib/analytics'

// Fully typed ecommerce event
const ecommerceEvent: YandexMetricaEcommerce = {
  action: 'purchase',
  items: [
    {
      id: 'product-1',
      name: 'Product Name',
      category: 'Category',
      price: 100,
      quantity: 1
    }
  ],
  currency: 'RUB',
  value: 100,
  transaction_id: 'order-123'
}
```

## Performance

The library is optimized for performance:

- **Lazy Loading**: Scripts load only when needed
- **Error Boundaries**: Failed services don't break the app
- **Memory Management**: Events are limited and cleaned up
- **Tree Shaking**: Import only what you need

## Migration

See [MODERN_ANALYTICS_MIGRATION.md](../../../docs/MODERN_ANALYTICS_MIGRATION.md) for migration guide from the old analytics implementation.

## API Reference

### Services

- `YandexMetricaService` - Yandex Metrica implementation
- `VKPixelService` - VK Ads Pixel implementation

### Providers

- `AnalyticsProvider` - Main analytics provider
- `ModernAnalyticsProvider` - Backward-compatible wrapper

### Hooks

- `useAnalytics` - Main analytics hook
- `useYandexMetrica` - Yandex Metrica specific
- `useVKPixel` - VK Pixel specific
- `useEventTracking` - Event tracking utilities
- `useEcommerceTracking` - Ecommerce tracking utilities
- `useUserTracking` - User identification utilities
- `useAnalyticsDebug` - Debug and monitoring utilities

### Utilities

- `createAnalyticsConfig` - Create configuration object
- `createAnalyticsConfigFromEnv` - Create config from environment variables

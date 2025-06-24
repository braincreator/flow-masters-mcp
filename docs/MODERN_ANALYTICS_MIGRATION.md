# Modern Analytics Migration Guide

This guide explains how to migrate from the old analytics implementation to the new modern analytics library that supports Next.js 15 App Directory.

## What's New

### ✅ Improvements

- **Modern React Patterns**: Uses React hooks and context for better integration
- **TypeScript Support**: Full type safety with comprehensive TypeScript definitions
- **Next.js 15 App Directory**: Native support for the latest Next.js features
- **Better Error Handling**: Proper error boundaries and fallbacks
- **Unified API**: Single interface for Yandex Metrica, VK Ads Pixel, and Top.Mail.Ru
- **Debug Mode**: Built-in debugging tools for development
- **SSR Safe**: Proper server-side rendering support
- **Performance**: Optimized loading and initialization

### 📦 Package Dependencies

The new implementation uses:
- `react-yandex-metrika` - For reference patterns (not directly used)
- Custom modern implementation for both services

## Migration Steps

### 1. Update Imports

**Old:**
```tsx
import { AnalyticsProvider, useAnalytics } from '@/providers/AnalyticsProvider'
```

**New:**
```tsx
import { ModernAnalyticsProvider, useAnalytics } from '@/providers/ModernAnalyticsProvider'
// Or use the library directly:
import { AnalyticsProvider, useAnalytics } from '@/lib/analytics'
```

### 2. Update Provider Usage

**Old:**
```tsx
<AnalyticsProvider>
  {children}
</AnalyticsProvider>
```

**New:**
```tsx
<ModernAnalyticsProvider>
  {children}
</ModernAnalyticsProvider>
```

### 3. Update Hook Usage

The `useAnalytics` hook now provides a cleaner API:

**Old:**
```tsx
const { trackEvent, trackPageView, trackEcommerce } = useAnalytics()

trackEvent('page_view', 'view', '/home')
```

**New:**
```tsx
const { trackEvent, trackPageView, trackEcommerce } = useAnalytics()

// Cleaner API
trackEvent('button_click', { button: 'cta', location: 'hero' })
trackPageView('/home', 'Home Page')
```

### 4. Use Specialized Hooks

The new implementation provides specialized hooks for better organization:

```tsx
import {
  useYandexMetrica,
  useVKPixel,
  useTopMailRu,
  useEventTracking,
  useEcommerceTracking
} from '@/lib/analytics'

function MyComponent() {
  // Service-specific hooks
  const ym = useYandexMetrica()
  const vk = useVKPixel()
  const tmr = useTopMailRu()

  // Feature-specific hooks
  const { trackEvent, trackGoal } = useEventTracking()
  const { trackPurchase } = useEcommerceTracking()

  const handleClick = () => {
    // Track with all services
    trackEvent('button_click', { button: 'cta' })

    // Or track with specific services
    ym.goal('yandex_goal')
    vk.event('vk_event')
    tmr.goal('tmr_goal')
  }
}
```

## New Features

### 1. Specialized Hooks

```tsx
// Yandex Metrica specific
const ym = useYandexMetrica()
ym.hit('/custom-page')
ym.goal('conversion', { value: 100 })
ym.ecommerce({ action: 'purchase', items: [...] })

// VK Pixel specific
const vk = useVKPixel()
vk.event('custom_event', { param: 'value' })
vk.goal('conversion')

// Top.Mail.Ru (VK Ads) specific
const tmr = useTopMailRu()
tmr.pageView({ source: 'homepage' })
tmr.goal('conversion', { value: 100 })
tmr.event({ type: 'reachGoal', goal: 'custom_goal' })

// Event tracking
const { trackEvent, trackGoal } = useEventTracking()
trackEvent('user_action', { action: 'click' })
trackGoal('conversion', { source: 'homepage' })

// Ecommerce tracking
const { trackPurchase, trackAddToCart } = useEcommerceTracking()
trackPurchase(items, transactionId, value)
trackAddToCart(items)
```

### 2. Debug Mode

In development, you'll see a debug panel in the bottom-right corner:

- Service health status
- Recent events log
- Test buttons for each service
- Real-time event monitoring

### 3. Better Error Handling

```tsx
try {
  const analytics = useAnalytics()
  analytics.trackEvent('test')
} catch (error) {
  // Proper error handling with AnalyticsError
  console.error('Analytics error:', error)
}
```

### 4. Health Monitoring

```tsx
const { getHealth } = useAnalyticsDebug()

const health = getHealth()
console.log('Yandex Metrica:', health.yandexMetrica.loaded)
console.log('VK Pixel:', health.vkPixel.loaded)
```

## Configuration

### Environment Variables

The same environment variables are used:

```env
NEXT_PUBLIC_YANDEX_METRIKA_ID=your_counter_id
NEXT_PUBLIC_VK_PIXEL_ID=your_pixel_id
NEXT_PUBLIC_TOP_MAIL_RU_ID=your_counter_id
```

### Advanced Configuration

For advanced use cases, you can configure the analytics directly:

```tsx
import { AnalyticsProvider, createAnalyticsConfig } from '@/lib/analytics'

const config = createAnalyticsConfig({
  yandexMetricaId: 'your_id',
  vkPixelId: ['pixel1', 'pixel2'], // Multiple pixels
  debug: true,
  enabled: true
})

<AnalyticsProvider config={config}>
  {children}
</AnalyticsProvider>
```

## Backward Compatibility

The new implementation maintains backward compatibility:

- Same environment variables
- Similar API structure
- Automatic page tracking
- Same event tracking patterns

## Testing

### Debug Panel

In development mode, you'll see a debug panel that allows you to:

- Check service health
- Test each analytics service
- View recent events
- Monitor real-time tracking

### Manual Testing

```tsx
import { AnalyticsExample } from '@/components/analytics/AnalyticsExample'

// Add this component to any page for testing
<AnalyticsExample />
```

## Troubleshooting

### Common Issues

1. **Services not loading**: Check environment variables and network connectivity
2. **TypeScript errors**: Ensure you're importing from the correct paths
3. **Events not tracking**: Check the debug panel for service status

### Debug Mode

Enable debug mode to see detailed logging:

```tsx
const config = createAnalyticsConfig({
  debug: true, // Enable debug logging
  // ... other config
})
```

## Performance

The new implementation is optimized for:

- **Lazy Loading**: Scripts load only when needed
- **Error Boundaries**: Failed services don't break the app
- **Memory Efficiency**: Events are limited and cleaned up
- **Bundle Size**: Tree-shakeable imports

## Next Steps

1. Update your layout to use `ModernAnalyticsProvider`
2. Test the debug panel in development
3. Update components to use new hooks
4. Remove old analytics components
5. Test in production

The migration should be seamless with improved developer experience and better performance.

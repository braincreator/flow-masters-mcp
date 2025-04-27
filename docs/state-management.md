# State Management Documentation

This document provides an overview of the state management system used in the Flow Masters application.

## Table of Contents

1. [Introduction](#introduction)
2. [Context Providers](#context-providers)
3. [Error Handling](#error-handling)
4. [Logging](#logging)
5. [Caching](#caching)
6. [Best Practices](#best-practices)

## Introduction

The Flow Masters application uses a context-based state management system to provide a centralized, consistent way to manage shared state across the application. This approach offers several benefits:

- **Single Source of Truth**: All components access the same state, ensuring consistency.
- **Reduced API Calls**: Eliminates duplicate API calls that would occur when multiple components use individual hooks.
- **Optimistic UI Updates**: Implements optimistic updates for better user experience.
- **Advanced Caching**: Provides sophisticated caching capabilities.
- **Improved Performance**: Reduces unnecessary re-renders and network requests.
- **Better Developer Experience**: Components can consume context without implementing their own data fetching logic.

## Context Providers

### Provider Structure

The application uses a hierarchical provider structure:

```jsx
<CacheProvider>
  <DropdownProvider>
    <ThemeProvider>
      <I18nProvider>
        <HeaderThemeProvider>
          <AuthProvider>
            <UserPreferencesProvider>
              <NotificationsProvider>
                <CartProvider>
                  <FavoritesProvider>
                    <PayloadAPIProvider>
                      <CurrencyProvider>
                        {children}
                      </CurrencyProvider>
                    </PayloadAPIProvider>
                  </FavoritesProvider>
                </CartProvider>
              </NotificationsProvider>
            </UserPreferencesProvider>
          </AuthProvider>
        </HeaderThemeProvider>
      </I18nProvider>
    </ThemeProvider>
  </DropdownProvider>
</CacheProvider>
```

### Available Providers

#### NotificationsProvider

Manages notification state globally.

```jsx
import { useNotifications } from '@/providers/NotificationsProvider'

function MyComponent() {
  const { 
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetchNotifications
  } = useNotifications()
  
  // Use notifications state and methods
}
```

#### CartProvider

Manages cart state globally.

```jsx
import { useCart } from '@/providers/CartProvider'

function MyComponent() {
  const { 
    cart,
    itemCount,
    total,
    isLoading,
    error,
    addItem,
    updateItem,
    removeItem,
    emptyCart,
    refreshCart
  } = useCart()
  
  // Use cart state and methods
}
```

#### FavoritesProvider

Manages user favorites with optimistic UI updates.

```jsx
import { useFavorites } from '@/providers/FavoritesProvider'

function MyComponent() {
  const { 
    favoriteProductIds,
    isLoading,
    error,
    isFavorite,
    toggle,
    refreshFavorites
  } = useFavorites()
  
  // Use favorites state and methods
}
```

#### UserPreferencesProvider

Manages user preferences like notification settings.

```jsx
import { useUserPreferences } from '@/providers/UserPreferencesProvider'

function MyComponent() {
  const { 
    preferences,
    isLoading,
    error,
    updatePreferences,
    refreshPreferences
  } = useUserPreferences()
  
  // Use preferences state and methods
}
```

#### CacheProvider

Provides a global cache for storing and retrieving data.

```jsx
import { useCache } from '@/providers/CacheProvider'

function MyComponent() {
  const cache = useCache()
  
  // Get data from cache
  const data = cache.get('my-key')
  
  // Set data in cache with 5-minute expiration
  cache.set('my-key', data, 5 * 60 * 1000)
  
  // Remove data from cache
  cache.remove('my-key')
  
  // Clear entire cache
  cache.clear()
  
  // Clear cache by pattern
  cache.clear('user-*')
  
  // Check if key exists and is not expired
  const hasKey = cache.has('my-key')
  
  // Invalidate cache entries by pattern
  cache.invalidate('product-*')
}
```

## Error Handling

The application uses a standardized error handling system defined in `src/utilities/errorHandling.ts`.

### AppError Class

The `AppError` class extends the standard Error class with additional properties and methods:

```typescript
import { AppError, ErrorType, ErrorSeverity } from '@/utilities/errorHandling'

// Create a new error
const error = new AppError({
  message: 'Failed to fetch data',
  type: ErrorType.NETWORK,
  severity: ErrorSeverity.WARNING,
  statusCode: 404,
  context: { id: '123' }
})

// Log the error
error.log()

// Show a toast notification
error.notify({ title: 'Data Error' })

// Get user-friendly message
const message = error.getUserMessage()
```

### Error Types

- `NETWORK`: Network connection issues
- `AUTHENTICATION`: Authentication required
- `AUTHORIZATION`: Permission denied
- `VALIDATION`: Invalid input
- `NOT_FOUND`: Resource not found
- `SERVER`: Server error
- `UNKNOWN`: Unexpected error
- `PRICE`: Price processing error

### Error Severity Levels

- `INFO`: Informational errors
- `WARNING`: Warning errors
- `ERROR`: Standard errors
- `CRITICAL`: Critical errors

### Helper Functions

- `createAppError`: Create an AppError from any error
- `handleApiError`: Handle API errors with appropriate type and severity
- `tryCatch`: Async error handler for try/catch blocks

```typescript
import { tryCatch } from '@/utilities/errorHandling'

async function fetchData() {
  const { data, error } = await tryCatch(async () => {
    const response = await fetch('/api/data')
    return response.json()
  })
  
  if (error) {
    // Handle error
    error.notify()
    return null
  }
  
  return data
}
```

## Logging

The application uses a state logging system defined in `src/utilities/stateLogger.ts`.

### StateLogger Class

The `StateLogger` class provides methods for logging state changes with different levels:

```typescript
import { useStateLogger } from '@/utilities/stateLogger'

function MyComponent() {
  const logger = useStateLogger('MyComponent')
  
  // Log state changes
  logger.info('User logged in', prevState, nextState, payload, metadata)
  logger.debug('Fetching data')
  logger.warn('API rate limit approaching')
  logger.error('Failed to update user', prevState, nextState, { userId: '123' })
  logger.trace('Render complete')
}
```

### Log Levels

- `NONE`: No logging
- `ERROR`: Error logs only
- `WARN`: Warnings and errors
- `INFO`: Info, warnings, and errors
- `DEBUG`: Debug, info, warnings, and errors
- `TRACE`: All logs

## Caching

The application uses a caching system provided by the `CacheProvider` and the `useCachedFetch` hook.

### useCachedFetch Hook

The `useCachedFetch` hook combines the CacheProvider with data fetching:

```typescript
import { useCachedFetch } from '@/hooks/useCachedFetch'

function MyComponent() {
  const { 
    data, 
    error, 
    isLoading, 
    refetch 
  } = useCachedFetch('/api/products', {
    cacheTime: 5 * 60 * 1000, // 5 minutes
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 30000, // 30 seconds
    deps: [categoryId] // Refetch when categoryId changes
  })
  
  // Use data
}
```

### Options

- `cacheTime`: Cache expiration in milliseconds
- `revalidateOnFocus`: Automatically refetch data on window focus
- `revalidateOnReconnect`: Automatically refetch data on network reconnection
- `refreshInterval`: Refetch interval in milliseconds (0 = no polling)
- `deps`: Dependencies that trigger refetch when changed

## Best Practices

### When to Use Context

Use context providers for:

- State that is shared across multiple components
- State that needs to be consistent across the application
- State that requires optimistic updates
- State that benefits from caching

### When Not to Use Context

Don't use context providers for:

- Component-specific state (use `useState` instead)
- Form state (use form libraries like React Hook Form)
- State that doesn't need to be shared

### Optimistic Updates

Implement optimistic updates for better user experience:

1. Save the current state
2. Update the state optimistically
3. Make the API call
4. If the API call fails, revert to the saved state

```typescript
// Example of optimistic update
const handleToggleFavorite = async (productId) => {
  // Save current state
  const previousState = [...favoriteProductIds]
  
  // Update state optimistically
  setFavoriteProductIds(prev => {
    const newState = new Set(prev)
    if (newState.has(productId)) {
      newState.delete(productId)
    } else {
      newState.add(productId)
    }
    return newState
  })
  
  try {
    // Make API call
    await toggleFavorite(productId)
  } catch (error) {
    // Revert to previous state on error
    setFavoriteProductIds(previousState)
    throw error
  }
}
```

### Error Handling

Always handle errors properly:

1. Use the `tryCatch` helper for async operations
2. Log errors with appropriate level
3. Show user-friendly error messages
4. Revert optimistic updates on error

### Performance Considerations

- Use memoization to prevent unnecessary re-renders
- Only include necessary state in the context value
- Consider splitting large contexts into smaller, more focused contexts
- Use the `useMemo` hook to memoize the context value

```typescript
const value = useMemo(() => ({
  cart,
  itemCount,
  total,
  isLoading,
  error,
  addItem,
  updateItem,
  removeItem,
  emptyCart,
  refreshCart
}), [cart, itemCount, total, isLoading, error])
```

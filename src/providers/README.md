# Context Providers

This directory contains React Context Providers that manage global state across the application.

## Available Providers

### AuthProvider

Manages user authentication state and methods.

- `useAuth()` - Access authentication state and methods

### BlogProvider

Manages blog-related functionality and state.

- `useBlog()` - Access blog posts, comments, and related functionality

### SearchProvider

Manages site-wide search functionality.

- `useSearch()` - Access search state and methods

### ThemeProvider

Manages theme preferences (light/dark/system).

- `useTheme()` - Access theme state and methods

### LocaleProvider

Manages language preferences and internationalization.

- `useLocale()` - Access locale state and methods

### CacheProvider

Manages in-memory caching for API responses.

- `useCache()` - Access cache state and methods

### Other Providers

- `HeaderThemeProvider` - Manages header theme state
- `DropdownProvider` - Manages dropdown state
- `NotificationsProvider` - Manages notifications
- `CartProvider` - Manages shopping cart
- `FavoritesProvider` - Manages user favorites
- `UserPreferencesProvider` - Manages user preferences
- `PayloadAPIProvider` - Manages Payload CMS API access
- `CurrencyProvider` - Manages currency preferences

## Usage

All providers are included in the `RootProvider` component, which wraps the entire application. You can access any provider's state and methods using the corresponding hook:

```tsx
import { useAuth, useBlog, useSearch, useTheme, useLocale } from '@/hooks/useContexts'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  const { posts, fetchPosts, searchPosts } = useBlog()
  const { query, results, search } = useSearch()
  const { theme, setTheme } = useTheme()
  const { locale, setLocale } = useLocale()

  // Use the context values and methods
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <button onClick={() => login('user@example.com', 'password')}>Login</button>
      )}
    </div>
  )
}
```

### Optimized Usage with Selector Hooks

For better performance, you can use selector hooks to only subscribe to the parts of the context that you need:

```tsx
import { useBlogPosts, useSearchState, useCurrentLocale } from '@/hooks/useContexts'

function OptimizedComponent() {
  // Only re-renders when posts-related state changes
  const { posts, fetchPosts } = useBlogPosts()

  // Only re-renders when search state changes
  const { query, results, search } = useSearchState()

  // Only re-renders when locale changes
  const { locale, setLocale } = useCurrentLocale()

  return (
    <div>
      <button onClick={() => fetchPosts()}>Fetch Posts</button>
      <input value={query} onChange={(e) => search(e.target.value)} placeholder="Search..." />
      <select value={locale} onChange={(e) => setLocale(e.target.value)}>
        <option value="en">English</option>
        <option value="ru">Russian</option>
      </select>
    </div>
  )
}
```

You can also create custom selectors for specific use cases:

```tsx
import { useBlogSelector, useSearchSelector } from '@/hooks/useContexts'

function CustomSelectorComponent() {
  // Custom blog selector that only includes what you need
  const { posts, isLoading } = useBlogSelector((context) => ({
    posts: context.posts,
    isLoading: context.isLoading,
  }))

  // Custom search selector
  const { query, setQuery } = useSearchSelector((context) => ({
    query: context.query,
    setQuery: context.setQuery,
  }))

  return (
    <div>
      {isLoading ? <p>Loading...</p> : <p>{posts.length} posts found</p>}
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
    </div>
  )
}
```

## Provider Hierarchy

The providers are nested in a specific order to ensure dependencies are available:

```
CacheProvider
└── DropdownProvider
    └── ThemeProvider
        └── I18nProvider (Legacy)
            └── LocaleProvider
                └── HeaderThemeProvider
                    └── AuthProvider
                        └── UserPreferencesProvider
                            └── NotificationsProvider
                                └── CartProvider
                                    └── FavoritesProvider
                                        └── PayloadAPIProvider
                                            └── CurrencyProvider
                                                └── BlogProvider
                                                    └── SearchProvider
                                                        └── {children}
```

This hierarchy ensures that providers that depend on others are nested inside them.

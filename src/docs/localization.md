# Localization System Documentation

## Overview
The localization system provides efficient content translation management with caching, fallbacks, and performance monitoring.

## Key Features

### 1. Content Localization
```typescript
const content = await getLocalizedContent(collection, docId, locale)
```
- Fetches localized content for specified collection and document
- Supports fallback to default locale if translation missing
- Automatically caches results for improved performance

### 2. Batch Operations
```typescript
const items = [
  { collection: 'posts', docId: '123', locale: 'en' },
  { collection: 'posts', docId: '124', locale: 'ru' }
]
const results = await getLocalizedContentBatch(items)
```
- Efficiently fetch multiple translations in parallel
- Automatic error handling per item
- Returns array of successful results

### 3. Cache Management
The system uses LRU (Least Recently Used) cache with:
- Maximum 1000 entries
- 1-hour TTL (Time To Live)
- 5MB total cache size limit
- Automatic cleanup of old entries
- Persistence to prevent cold starts

### 4. Performance Monitoring
```typescript
const metrics = getLocalizationMetrics()
// Returns:
{
  hits: number,        // Cache hit count
  misses: number,      // Cache miss count
  errors: number,      // Error count
  cacheSize: number,   // Current cache size
  itemCount: number    // Number of cached items
}

const performance = getPerformanceMetrics()
// Returns:
{
  avgFetchTime: number,  // Average fetch time in ms
  maxFetchTime: number,  // Maximum fetch time in ms
}
```

### 5. Cache Preloading
```typescript
await preloadCommonContent()
```
- Automatically preloads common content (header, footer, navigation)
- Runs on system startup
- Configurable collection list

### 6. Cache Persistence
- Automatically saves cache to disk every 30 minutes
- Saves on system shutdown
- Loads cached content on startup
- Prevents cold starts

### 7. Cache Invalidation
```typescript
invalidateLocaleCache(collection, docId)
```
- Manually invalidate cache entries
- Supports pattern-based invalidation
- Automatic cleanup of stale entries

## Configuration

### Environment Variables
```env
DEFAULT_LOCALE=en
SUPPORTED_LOCALES=en,ru
CACHE_DIRECTORY=.cache
```

### Constants
```typescript
SUPPORTED_LOCALES: ['en', 'ru']
DEFAULT_LOCALE: 'en'
CACHE_FILE: '.cache/locale-cache.json'
```

## Best Practices

1. **Error Handling**
   - Always provide fallback content for missing translations
   - Log and monitor translation errors
   - Use try-catch blocks when working with localization functions

2. **Performance**
   - Use batch operations for multiple items
   - Monitor cache hit rates
   - Preload frequently accessed content
   - Keep translations under 5MB total size

3. **Cache Management**
   - Regularly monitor cache metrics
   - Set up alerts for high error rates
   - Implement cache warming for critical content
   - Use cache invalidation when content updates

## Integration with PayloadCMS

The system integrates with PayloadCMS collections:
- Automatically handles localized fields
- Supports rich text content
- Works with media references
- Handles nested relationships

Example collection configuration:
```typescript
{
  slug: 'posts',
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true
    }
  ]
}
```

## Monitoring and Maintenance

1. **Regular Monitoring**
   - Check cache hit rates
   - Monitor error rates
   - Review performance metrics
   - Verify cache size

2. **Maintenance Tasks**
   - Clear cache periodically
   - Update preload content list
   - Review and update fallback content
   - Monitor disk usage for cache files

## Troubleshooting

Common issues and solutions:

1. **Missing Translations**
   - Check if locale is supported
   - Verify content exists in default locale
   - Review fallback configuration

2. **Performance Issues**
   - Monitor cache hit rates
   - Check average fetch times
   - Verify preloading configuration
   - Review cache size limits

3. **Cache Problems**
   - Check disk permissions
   - Verify cache file location
   - Monitor memory usage
   - Review cache configuration
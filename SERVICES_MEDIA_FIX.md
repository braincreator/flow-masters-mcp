# Services Media Loading Fix

## Problem Description

The Services collection was experiencing infinite loading when fetching related media for the thumbnail field. This was causing the admin interface and API endpoints to hang or timeout when trying to load services with media relationships.

## Root Cause Analysis

The issue was caused by several factors:

1. **Circular References**: The `relatedServices` field in the Services collection references itself (`relationTo: 'services'`), which could create infinite loops when loading with `depth > 0`.

2. **Uncontrolled Depth Loading**: Media relationships (thumbnail, gallery images, meta image) were loading without depth limits, potentially causing cascading queries.

3. **Missing Timeout Protection**: API routes lacked timeout protection, allowing queries to hang indefinitely.

## Changes Made

### 1. Services Collection Configuration (`src/collections/Services/index.ts`)

Added `maxDepth: 0` only to the `relatedServices` field to prevent circular references:

- **relatedServices field**: Added `maxDepth: 0` to prevent circular references when services reference themselves
- **Media fields (thumbnail, gallery.image, meta.image)**: Left without maxDepth restrictions to allow proper media population

### 2. Services API Route (`src/app/api/v1/services/route.ts`)

Enhanced error handling and timeout protection:

- Added 30-second timeout protection using `Promise.race()`
- Improved error logging with detailed error information
- Added development-mode error details in response
- Added success logging for debugging

### 3. Test Script (`src/scripts/test-services-api.ts`)

Created a comprehensive test script to verify:

- Basic services queries with timing
- Media relationship loading (thumbnail, gallery, related services)
- Service lookup by slug
- Direct media collection queries
- Error handling and performance monitoring

## How to Test the Fix

### 1. Run the Test Script

```bash
npx tsx src/scripts/test-services-api.ts
```

This will test all aspects of services and media loading.

### 2. Test API Endpoints

```bash
# Test services list
curl "http://localhost:3000/api/v1/services?limit=5"

# Test services with locale
curl "http://localhost:3000/api/v1/services?locale=en&limit=3"

# Test specific service type
curl "http://localhost:3000/api/v1/services?type=consulting&limit=3"
```

### 3. Test Admin Interface

1. Navigate to `/admin/collections/services`
2. Verify that services load without infinite loading
3. Check that thumbnail images display correctly
4. Verify that related services show without causing loops

### 4. Test Frontend Pages

1. Visit service listing pages
2. Check individual service pages
3. Verify that thumbnails and gallery images load correctly

## Expected Behavior After Fix

- ✅ Services API should respond within 30 seconds (typically much faster)
- ✅ Thumbnail images should load as fully populated media objects with URLs and metadata
- ✅ Related services should display as references (IDs) rather than fully populated objects
- ✅ Gallery images should load efficiently as populated media objects
- ✅ Admin interface should be responsive when editing services
- ✅ No more hanging or timeout issues when fetching services

## Performance Improvements

1. **Prevented Circular References**: `maxDepth: 0` on `relatedServices` prevents infinite loops
2. **Maintained Media Population**: Media fields still populate fully for proper frontend functionality
3. **Timeout Protection**: 30-second timeout prevents hanging requests
4. **Better Error Handling**: Detailed logging helps identify issues quickly

## Monitoring

Watch for these log messages to verify the fix is working:

```
[API /services] Successfully fetched services: X
[API /services] Query completed in Xms
```

If you see timeout errors, check the logs for:

```
Services query timeout
Error fetching services: [detailed error]
```

## Rollback Plan

If issues persist, you can temporarily revert by:

1. Removing `maxDepth: 0` from media fields in Services collection
2. Reverting the API route timeout changes
3. Using `depth: 0` in API queries as a temporary workaround

## Additional Notes

- Only the `relatedServices` field uses `maxDepth: 0` to prevent circular references
- Media relationships (thumbnail, gallery, meta.image) are fully populated with URLs, sizes, and metadata
- Frontend components can rely on populated media objects being available
- Consider implementing caching for frequently accessed services to improve performance further

# CORS Configuration for FlowMasters

## Overview

Cross-Origin Resource Sharing (CORS) is configured to allow secure access to FlowMasters APIs from authorized domains while preventing unauthorized access.

## Configuration Structure

### 1. Centralized Configuration (`src/config/cors.ts`)

All CORS settings are centralized in a single configuration file:

- **Production Origins**: Main FlowMasters domains
- **Ecosystem Origins**: Related services (n8n, Flowise, OpenWebUI, etc.)
- **Monitoring Origins**: Grafana, Prometheus, cAdvisor
- **Development Origins**: Local development servers

### 2. CORS Utility (`src/utilities/cors.ts`)

Provides helper functions for:
- Getting allowed origins based on environment
- Checking if an origin is allowed
- Creating CORS headers
- Creating preflight responses
- Adding CORS headers to responses

### 3. CORS Middleware (`src/middleware/cors.ts`)

Automatically handles CORS for all API routes:
- Processes preflight OPTIONS requests
- Adds appropriate CORS headers to responses
- Validates origins against allowed list

## Allowed Origins

### Production Environment

```typescript
// Main domains
'https://flow-masters.ru'
'https://www.flow-masters.ru'
'https://admin.flow-masters.ru'
'https://api.flow-masters.ru'

// Ecosystem services
'https://n8n.flow-masters.ru'
'https://flowise.flow-masters.ru'
'https://openwebui.flow-masters.ru'
'https://letta.flow-masters.ru'
'https://crawl4ai.flow-masters.ru'
'https://qdrant.flow-masters.ru'
'https://weaviate.flow-masters.ru'

// Monitoring services
'https://grafana.flow-masters.ru'
'https://prometheus.flow-masters.ru'
'https://cadvisor.flow-masters.ru'
'https://coolify.flow-masters.ru'
```

### Development Environment

```typescript
'http://localhost:3000'
'http://localhost:3001'
'http://localhost:3002'
'http://localhost:3003'
'http://localhost:3030'
'http://127.0.0.1:3000'
'http://127.0.0.1:3001'
'http://127.0.0.1:3002'
'http://127.0.0.1:3003'
'http://127.0.0.1:3030'
```

## CORS Headers

### Standard Headers

- **Access-Control-Allow-Origin**: Dynamically set based on request origin
- **Access-Control-Allow-Methods**: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
- **Access-Control-Allow-Headers**: Content-Type, Authorization, X-Requested-With, etc.
- **Access-Control-Allow-Credentials**: true
- **Access-Control-Max-Age**: 86400 (24 hours)

### Exposed Headers

Headers that client-side JavaScript can access:
- X-Total-Count
- X-Page-Count
- X-Current-Page
- X-Per-Page
- X-Request-ID
- X-Response-Time

## API Endpoint Categories

### Public Endpoints (Permissive CORS)
- `/api/health`
- `/api/v1/health`
- `/api/v1/globals`
- `/api/v1/posts`
- `/api/v1/categories`
- `/api/v1/tags`

### Protected Endpoints (Strict CORS)
- `/api/v1/users`
- `/api/v1/admin`
- `/api/v1/auth`
- `/api/v1/payments`
- `/api/v1/orders`

### Internal Endpoints (Most Restrictive)
- `/api/v1/revalidate`
- `/api/v1/cron`
- `/api/v1/webhooks`
- `/api/v1/monitoring`

## Implementation

### 1. Automatic CORS Handling

CORS is automatically applied to all API routes through middleware:

```typescript
// In middleware.ts
import { corsMiddleware, addCorsToResponse } from '@/middleware/cors'

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  const corsResponse = corsMiddleware(request)
  if (corsResponse) {
    return corsResponse
  }
  
  // ... other middleware logic
}
```

### 2. Manual CORS in API Routes

For custom CORS handling in specific routes:

```typescript
import { createCorsResponse, createCorsPreflightResponse } from '@/utilities/cors'

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')
  
  return createCorsResponse(
    { data: 'your data' },
    { origin }
  )
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return createCorsPreflightResponse(origin)
}
```

## Security Features

### 1. Origin Validation
- Only requests from allowed origins are permitted
- Dynamic origin checking based on environment
- Fallback to main domain in production

### 2. Credentials Handling
- Credentials are allowed for authenticated requests
- Secure cookie transmission enabled
- Proper authentication header handling

### 3. Method Restrictions
- Only necessary HTTP methods are allowed
- OPTIONS requests are properly handled
- Preflight requests are validated

## Environment-Specific Behavior

### Development
- More permissive CORS settings
- Localhost origins allowed
- Request logging enabled

### Production
- Strict origin validation
- Only production domains allowed
- Enhanced security measures

## Troubleshooting

### Common CORS Issues

1. **Origin not allowed**
   - Check if origin is in allowed list
   - Verify environment configuration
   - Check for typos in domain names

2. **Preflight failures**
   - Ensure OPTIONS method is implemented
   - Check allowed headers configuration
   - Verify method permissions

3. **Credentials issues**
   - Confirm Access-Control-Allow-Credentials is set
   - Check cookie settings
   - Verify authentication headers

### Testing CORS

```bash
# Test preflight request
curl -X OPTIONS \
  -H "Origin: https://flow-masters.ru" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://flow-masters.ru/api/v1/health

# Test actual request
curl -X GET \
  -H "Origin: https://flow-masters.ru" \
  https://flow-masters.ru/api/v1/health
```

## Monitoring

CORS requests are monitored through:
- Request metrics collection
- Origin validation logging
- Error tracking for failed CORS requests
- Performance monitoring for preflight requests

## Updates and Maintenance

To add new allowed origins:

1. Update `src/config/cors.ts`
2. Add to appropriate origin array
3. Test the configuration
4. Deploy changes

For emergency CORS fixes:
1. Update environment variables if needed
2. Restart the application
3. Verify new settings work correctly
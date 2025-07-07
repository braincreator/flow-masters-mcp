# API Authentication Documentation
## Flow Masters Project - Enhanced Authentication System

**Version**: 2.0  
**Date**: 2025-01-06  
**Status**: ✅ PRODUCTION READY  

## Overview

The Flow Masters API uses an enhanced authentication system that supports both modern and legacy authentication formats. This documentation covers all authentication methods, endpoints, and best practices.

## Authentication Methods

### 1. Bearer Token Authentication (Recommended)

**Format**: `Authorization: Bearer <token>`  
**Status**: ✅ Recommended  
**Performance**: Optimal  

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.flow-masters.ru/api/posts
```

### 2. Legacy API Key Authentication (Deprecated)

**Format**: `x-api-key: <token>`  
**Status**: ⚠️ Deprecated (but supported)  
**Performance**: Slightly slower (includes deprecation logging)  

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api.flow-masters.ru/api/posts
```

### 3. Dual Header Support

When both headers are present, Bearer token takes precedence:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "x-api-key: OTHER_KEY" \
  https://api.flow-masters.ru/api/posts
# Uses Bearer token, ignores x-api-key
```

## API Key Management

### Obtaining API Keys

1. **Admin Panel**: Generate keys through Payload CMS admin interface
2. **Environment**: Use `PAYLOAD_SECRET` for development
3. **Production**: Contact administrators for production keys

### Key Security

- ✅ Store keys securely (environment variables, secret managers)
- ✅ Use HTTPS for all API requests
- ✅ Rotate keys regularly
- ❌ Never commit keys to version control
- ❌ Never expose keys in client-side code

## Endpoint Categories

### Protected Endpoints (Require Authentication)

#### Collection APIs
- `GET /api/[collection]` - List collection items
- `POST /api/[collection]` - Create new item
- `PUT /api/[collection]/[id]` - Update item
- `DELETE /api/[collection]/[id]` - Delete item
- `GET /api/[collection]/[id]` - Get specific item
- `GET /api/[collection]/meta` - Get collection metadata

**Collections**: `posts`, `pages`, `categories`, `tags`, `users`, `orders`, `services`

#### Integration APIs
- `POST /api/integrations` - Execute integration actions

#### Debug APIs (Development Only)
- `GET /api/debug/collections` - List available collections
- `GET /api/debug/test-posts` - Test posts functionality
- `POST /api/debug/create-test-post` - Create test post

#### Management APIs
- `GET /api/auth-middleware` - Authentication metrics and health
- `POST /api/auth-middleware` - Reset metrics and management

### Public Endpoints (No Authentication Required)

#### System Health
- `GET /api/health` - Basic health check
- `GET /api/monitoring` - System monitoring metrics

#### Content Access
- `GET /api/globals/[slug]` - Global configuration data
- `GET /api/[collection]/search` - Public search functionality

#### Communication
- `POST /api/send-email` - Send contact form emails

#### Payments
- `POST /api/payment/*` - Payment processing endpoints
- `POST /api/webhooks/*` - Webhook handlers

### Custom Authentication Endpoints

#### Cache Management
- `POST /api/revalidate` - Uses `REVALIDATION_TOKEN`

#### Scheduled Tasks
- `POST /api/cron/*` - Uses `CRON_SECRET`

## Request Examples

### Collection Operations

#### List Posts
```bash
# Bearer token (recommended)
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.flow-masters.ru/api/posts?limit=10&page=1"

# Legacy format
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api.flow-masters.ru/api/posts?limit=10&page=1"
```

#### Create Post
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Post",
    "content": "Post content here",
    "status": "published"
  }' \
  https://api.flow-masters.ru/api/posts
```

#### Get Specific Post
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.flow-masters.ru/api/posts/POST_ID
```

### Integration Operations

#### Find Documents
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "find",
    "collection": "posts",
    "data": {
      "where": {
        "status": { "equals": "published" }
      },
      "limit": 5
    }
  }' \
  https://api.flow-masters.ru/api/integrations
```

#### Create Document
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "collection": "posts",
    "data": {
      "title": "API Created Post",
      "content": "Content created via API",
      "status": "draft"
    }
  }' \
  https://api.flow-masters.ru/api/integrations
```

### Public Endpoints

#### Health Check
```bash
curl https://api.flow-masters.ru/api/health
```

#### Search Posts
```bash
curl "https://api.flow-masters.ru/api/posts/search?q=javascript&limit=5"
```

#### Get Global Settings
```bash
curl https://api.flow-masters.ru/api/globals/header
```

## Response Formats

### Success Response
```json
{
  "docs": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "Sample Post",
      "content": "Post content...",
      "status": "published",
      "createdAt": "2025-01-06T10:00:00.000Z",
      "updatedAt": "2025-01-06T10:00:00.000Z"
    }
  ],
  "totalDocs": 1,
  "limit": 10,
  "page": 1,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

### Error Responses

#### Authentication Error (401)
```json
{
  "error": "Missing API key. Use either \"Authorization: Bearer <token>\" or \"x-api-key: <token>\" header"
}
```

#### Invalid API Key (403)
```json
{
  "error": "Invalid API key"
}
```

#### Not Found (404)
```json
{
  "error": "Document not found"
}
```

#### Server Error (500)
```json
{
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

## Rate Limiting

### Current Limits
- **Authenticated Requests**: 1000 requests per hour
- **Public Endpoints**: 100 requests per hour per IP
- **Debug Endpoints**: 50 requests per hour (development only)

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641024000
```

## Error Handling

### Best Practices

1. **Check Status Codes**: Always verify HTTP status codes
2. **Parse Error Messages**: Extract meaningful error information
3. **Implement Retry Logic**: For temporary failures (5xx errors)
4. **Log Authentication Issues**: Track authentication failures

### Example Error Handling (JavaScript)

```javascript
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`https://api.flow-masters.ru${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API Error (${response.status}): ${error.error}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}
```

## Migration Guide

### From x-api-key to Bearer Token

#### Step 1: Update Headers
```bash
# Old format
curl -H "x-api-key: YOUR_API_KEY" \
  https://api.flow-masters.ru/api/posts

# New format
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.flow-masters.ru/api/posts
```

#### Step 2: Update Client Code
```javascript
// Old format
const headers = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json'
}

// New format
const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
}
```

#### Step 3: Test and Validate
1. Test new format with existing endpoints
2. Verify all functionality works correctly
3. Monitor for deprecation warnings in logs
4. Update documentation and examples

### Transition Period

- **Current Status**: Both formats supported
- **Deprecation Warnings**: Legacy format generates warnings
- **Timeline**: Legacy support maintained indefinitely
- **Recommendation**: Migrate to Bearer token format for optimal performance

## Monitoring and Analytics

### Authentication Metrics

#### Get Current Metrics
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.flow-masters.ru/api/auth-middleware?action=metrics"
```

#### Response Example
```json
{
  "success": true,
  "metrics": {
    "bearer_requests": 1250,
    "legacy_requests": 150,
    "total_requests": 1400,
    "bearer_percentage": 89,
    "legacy_percentage": 11
  },
  "recommendations": {
    "migration_status": "in_progress",
    "suggestion": "Consider migrating remaining integrations to Authorization: Bearer format"
  }
}
```

### Health Monitoring

#### System Health
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.flow-masters.ru/api/auth-middleware?action=health"
```

#### Configuration Info
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.flow-masters.ru/api/auth-middleware?action=config"
```

## SDK and Libraries

### Official SDKs

#### JavaScript/Node.js
```javascript
import { FlowMastersAPI } from '@flow-masters/api-client'

const api = new FlowMastersAPI({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'https://api.flow-masters.ru'
})

// Automatically uses Bearer token format
const posts = await api.posts.list({ limit: 10 })
```

#### Python
```python
from flow_masters import FlowMastersAPI

api = FlowMastersAPI(
    api_key='YOUR_API_KEY',
    base_url='https://api.flow-masters.ru'
)

# Automatically uses Bearer token format
posts = api.posts.list(limit=10)
```

### Community Libraries

Check the [Flow Masters GitHub organization](https://github.com/flow-masters) for community-contributed SDKs and examples.

## Support and Resources

### Documentation
- **API Reference**: [https://docs.flow-masters.ru/api](https://docs.flow-masters.ru/api)
- **Authentication Guide**: This document
- **Integration Examples**: [https://github.com/flow-masters/examples](https://github.com/flow-masters/examples)

### Support Channels
- **Email**: api-support@flow-masters.ru
- **GitHub Issues**: [https://github.com/flow-masters/api-issues](https://github.com/flow-masters/api-issues)
- **Community Forum**: [https://community.flow-masters.ru](https://community.flow-masters.ru)

### Status Page
- **API Status**: [https://status.flow-masters.ru](https://status.flow-masters.ru)
- **Maintenance Windows**: Announced 48 hours in advance
- **Incident Reports**: Available on status page

---

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:
- **Swagger UI**: [https://api.flow-masters.ru/docs](https://api.flow-masters.ru/docs)
- **JSON Spec**: [https://api.flow-masters.ru/openapi.json](https://api.flow-masters.ru/openapi.json)
- **YAML Spec**: [https://api.flow-masters.ru/openapi.yaml](https://api.flow-masters.ru/openapi.yaml)

### Authentication Security Schemes

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: "Recommended: Use Authorization: Bearer <token>"

    ApiKeyAuth:
      type: apiKey
      in: header
      name: x-api-key
      description: "Legacy: Use x-api-key header (deprecated)"

security:
  - BearerAuth: []
  - ApiKeyAuth: []
```

---

**Last Updated**: 2025-01-06
**Version**: 2.0
**Next Review**: 2025-02-06

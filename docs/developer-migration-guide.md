# Developer Migration Guide
## Flow Masters API - Authentication Migration

**Target Audience**: Developers integrating with Flow Masters API  
**Migration Type**: x-api-key → Authorization: Bearer  
**Timeline**: Gradual migration (both formats supported)  
**Status**: ✅ Ready for migration  

## Quick Start

### Before (Legacy Format)
```javascript
const response = await fetch('https://api.flow-masters.ru/api/posts', {
  headers: {
    'x-api-key': 'your-api-key',
    'Content-Type': 'application/json'
  }
})
```

### After (Recommended Format)
```javascript
const response = await fetch('https://api.flow-masters.ru/api/posts', {
  headers: {
    'Authorization': 'Bearer your-api-key',
    'Content-Type': 'application/json'
  }
})
```

## Why Migrate?

### Benefits of Bearer Token Format

1. **Industry Standard**: OAuth 2.0 and JWT standard format
2. **Better Security**: Follows RFC 6750 specification
3. **Tool Support**: Better support in API testing tools
4. **Performance**: Optimized authentication processing
5. **Future-Proof**: Prepared for advanced authentication features

### Migration Timeline

- ✅ **Now**: Both formats supported
- ⚠️ **Current**: Legacy format shows deprecation warnings
- 🔄 **Ongoing**: Gradual migration recommended
- ♾️ **Future**: Legacy support maintained indefinitely

## Migration Steps

### Step 1: Update Authentication Headers

#### JavaScript/Node.js
```javascript
// OLD: x-api-key header
const oldHeaders = {
  'x-api-key': process.env.API_KEY,
  'Content-Type': 'application/json'
}

// NEW: Authorization Bearer
const newHeaders = {
  'Authorization': `Bearer ${process.env.API_KEY}`,
  'Content-Type': 'application/json'
}
```

#### Python
```python
# OLD: x-api-key header
old_headers = {
    'x-api-key': os.getenv('API_KEY'),
    'Content-Type': 'application/json'
}

# NEW: Authorization Bearer
new_headers = {
    'Authorization': f'Bearer {os.getenv("API_KEY")}',
    'Content-Type': 'application/json'
}
```

#### PHP
```php
// OLD: x-api-key header
$oldHeaders = [
    'x-api-key: ' . $_ENV['API_KEY'],
    'Content-Type: application/json'
];

// NEW: Authorization Bearer
$newHeaders = [
    'Authorization: Bearer ' . $_ENV['API_KEY'],
    'Content-Type: application/json'
];
```

#### cURL
```bash
# OLD: x-api-key header
curl -H "x-api-key: $API_KEY" \
  https://api.flow-masters.ru/api/posts

# NEW: Authorization Bearer
curl -H "Authorization: Bearer $API_KEY" \
  https://api.flow-masters.ru/api/posts
```

### Step 2: Update HTTP Client Libraries

#### Axios (JavaScript)
```javascript
// OLD configuration
const oldAxios = axios.create({
  baseURL: 'https://api.flow-masters.ru',
  headers: {
    'x-api-key': process.env.API_KEY
  }
})

// NEW configuration
const newAxios = axios.create({
  baseURL: 'https://api.flow-masters.ru',
  headers: {
    'Authorization': `Bearer ${process.env.API_KEY}`
  }
})
```

#### Fetch API (JavaScript)
```javascript
// OLD fetch wrapper
async function oldApiCall(endpoint, options = {}) {
  return fetch(`https://api.flow-masters.ru${endpoint}`, {
    ...options,
    headers: {
      'x-api-key': process.env.API_KEY,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
}

// NEW fetch wrapper
async function newApiCall(endpoint, options = {}) {
  return fetch(`https://api.flow-masters.ru${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${process.env.API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
}
```

#### Requests (Python)
```python
import requests
import os

# OLD session setup
old_session = requests.Session()
old_session.headers.update({
    'x-api-key': os.getenv('API_KEY'),
    'Content-Type': 'application/json'
})

# NEW session setup
new_session = requests.Session()
new_session.headers.update({
    'Authorization': f'Bearer {os.getenv("API_KEY")}',
    'Content-Type': 'application/json'
})
```

### Step 3: Update Environment Variables (Optional)

Consider updating environment variable names for clarity:

```bash
# OLD naming
API_KEY=your-secret-key

# NEW naming (optional)
FLOW_MASTERS_API_TOKEN=your-secret-key
# or
BEARER_TOKEN=your-secret-key
```

### Step 4: Test Migration

#### Test Both Formats
```javascript
// Test function to verify both formats work
async function testAuthentication() {
  const endpoint = 'https://api.flow-masters.ru/api/test-enhanced-auth'
  
  // Test new format
  const bearerResponse = await fetch(endpoint, {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  })
  
  // Test old format (should still work)
  const legacyResponse = await fetch(endpoint, {
    headers: { 'x-api-key': API_KEY }
  })
  
  console.log('Bearer format:', bearerResponse.ok)
  console.log('Legacy format:', legacyResponse.ok)
}
```

#### Validate All Endpoints
```javascript
const endpoints = [
  '/api/posts',
  '/api/categories',
  '/api/integrations'
]

for (const endpoint of endpoints) {
  const response = await fetch(`https://api.flow-masters.ru${endpoint}`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  })
  console.log(`${endpoint}: ${response.ok ? 'OK' : 'FAILED'}`)
}
```

## Framework-Specific Examples

### React/Next.js
```javascript
// hooks/useApi.js
import { useState, useEffect } from 'react'

export function useApi(endpoint) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
          }
        })
        
        if (!response.ok) throw new Error('API request failed')
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [endpoint])

  return { data, loading, error }
}
```

### Vue.js
```javascript
// plugins/api.js
export default {
  install(app, options) {
    app.config.globalProperties.$api = {
      async request(endpoint, options = {}) {
        return fetch(`https://api.flow-masters.ru${endpoint}`, {
          ...options,
          headers: {
            'Authorization': `Bearer ${process.env.VUE_APP_API_KEY}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        })
      }
    }
  }
}
```

### Express.js Middleware
```javascript
// middleware/flowMastersApi.js
const axios = require('axios')

const flowMastersApi = axios.create({
  baseURL: 'https://api.flow-masters.ru',
  headers: {
    'Authorization': `Bearer ${process.env.FLOW_MASTERS_API_KEY}`
  }
})

module.exports = (req, res, next) => {
  req.flowMastersApi = flowMastersApi
  next()
}
```

## Error Handling Updates

### Enhanced Error Detection
```javascript
async function apiRequestWithErrorHandling(endpoint, options = {}) {
  try {
    const response = await fetch(`https://api.flow-masters.ru${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      ...options
    })

    // Check for authentication errors
    if (response.status === 401) {
      throw new Error('Authentication failed - check your API key')
    }
    
    if (response.status === 403) {
      throw new Error('Invalid API key')
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`API Error: ${error.error}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}
```

## Testing Your Migration

### Unit Tests
```javascript
// tests/api.test.js
describe('API Authentication', () => {
  test('should authenticate with Bearer token', async () => {
    const response = await fetch('https://api.flow-masters.ru/api/test-enhanced-auth', {
      headers: { 'Authorization': `Bearer ${process.env.API_KEY}` }
    })
    
    expect(response.ok).toBe(true)
  })

  test('should handle authentication errors', async () => {
    const response = await fetch('https://api.flow-masters.ru/api/posts', {
      headers: { 'Authorization': 'Bearer invalid-key' }
    })
    
    expect(response.status).toBe(403)
  })
})
```

### Integration Tests
```javascript
// tests/integration.test.js
describe('API Integration', () => {
  const endpoints = [
    '/api/posts',
    '/api/categories',
    '/api/integrations'
  ]

  endpoints.forEach(endpoint => {
    test(`${endpoint} should work with Bearer token`, async () => {
      const response = await fetch(`https://api.flow-masters.ru${endpoint}`, {
        headers: { 'Authorization': `Bearer ${process.env.API_KEY}` }
      })
      
      expect(response.ok).toBe(true)
    })
  })
})
```

## Monitoring Migration Progress

### Check Authentication Metrics
```javascript
async function checkMigrationProgress() {
  const response = await fetch('https://api.flow-masters.ru/api/auth-middleware?action=metrics', {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  })
  
  const data = await response.json()
  
  console.log('Migration Progress:')
  console.log(`Bearer token usage: ${data.metrics.bearer_percentage}%`)
  console.log(`Legacy usage: ${data.metrics.legacy_percentage}%`)
  console.log(`Recommendation: ${data.recommendations.suggestion}`)
}
```

## Troubleshooting

### Common Issues

#### 1. "Missing API key" Error
```javascript
// Problem: Incorrect header format
headers: { 'Authorization': 'your-api-key' } // ❌ Missing 'Bearer'

// Solution: Include 'Bearer' prefix
headers: { 'Authorization': 'Bearer your-api-key' } // ✅ Correct
```

#### 2. Environment Variable Issues
```javascript
// Problem: Undefined environment variable
const token = process.env.API_KEY // ❌ Might be undefined

// Solution: Add validation
const token = process.env.API_KEY
if (!token) {
  throw new Error('API_KEY environment variable is required')
}
```

#### 3. CORS Issues
```javascript
// Problem: CORS errors in browser
// Solution: Ensure proper CORS headers are set on server

// For development, you might need to proxy requests
// Next.js example in next.config.js:
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.flow-masters.ru/api/:path*'
      }
    ]
  }
}
```

## Support and Resources

### Getting Help
- **Documentation**: [https://docs.flow-masters.ru](https://docs.flow-masters.ru)
- **API Reference**: [https://api.flow-masters.ru/docs](https://api.flow-masters.ru/docs)
- **Support Email**: api-support@flow-masters.ru
- **GitHub Issues**: [https://github.com/flow-masters/api-issues](https://github.com/flow-masters/api-issues)

### Migration Checklist

- [ ] Update authentication headers to use `Authorization: Bearer`
- [ ] Test all API endpoints with new format
- [ ] Update error handling for new response formats
- [ ] Update documentation and code comments
- [ ] Run integration tests
- [ ] Monitor authentication metrics
- [ ] Update team/client documentation

### Next Steps

1. **Complete Migration**: Update all integrations to use Bearer token format
2. **Monitor Usage**: Check authentication metrics regularly
3. **Update Documentation**: Keep internal documentation current
4. **Train Team**: Ensure all developers understand new format
5. **Plan for Future**: Prepare for potential advanced authentication features

---

**Need Help?** Contact our API support team at api-support@flow-masters.ru for assistance with your migration.

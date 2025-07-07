# API Key Management System
## Flow Masters - Enhanced API Key Management

**Version**: 2.0  
**Date**: 2025-01-06  
**Status**: ✅ PRODUCTION READY  

## Overview

The Flow Masters API Key Management System provides comprehensive functionality for creating, managing, and monitoring API keys with advanced security features, usage tracking, and granular permissions.

## Key Features

### 🔐 Security Features
- **Secure Key Generation**: Cryptographically secure 256-bit API keys
- **Key Hashing**: Bcrypt hashing for secure storage
- **IP Restrictions**: Limit key usage to specific IP addresses or CIDR ranges
- **Expiration Dates**: Optional key expiration for enhanced security
- **Permission System**: Granular permissions (read, write, delete, admin, debug)

### 📊 Usage Tracking
- **Real-time Monitoring**: Track key usage in real-time
- **Usage Statistics**: Count requests, last used date, IP tracking
- **User Agent Tracking**: Monitor client applications
- **Rate Limiting**: Configurable per-key rate limits

### 🛠️ Management Features
- **Key Rotation**: Secure key rotation without downtime
- **Bulk Operations**: Enable/disable multiple keys
- **Search and Filter**: Find keys by type, status, or usage
- **Tagging System**: Organize keys with custom tags

## Architecture

### Database Schema

The API keys are stored in the `apiKeys` collection with the following structure:

```typescript
interface ApiKey {
  id: string
  name: string                    // Human-readable name
  description?: string            // Optional description
  keyType: KeyType               // Type of key (general, mcp, mobile, etc.)
  key: string                    // Original key (only during creation)
  hashedKey: string              // Bcrypt hashed key for storage
  isEnabled: boolean             // Enable/disable status
  permissions: Permission[]       // Array of permissions
  allowedIPs?: IPRestriction[]   // IP address restrictions
  rateLimit: RateLimit           // Rate limiting configuration
  expiresAt?: Date               // Optional expiration date
  
  // Usage tracking
  usageCount: number             // Total usage count
  lastUsed?: Date                // Last usage timestamp
  lastUsedIP?: string            // Last client IP
  lastUsedUserAgent?: string     // Last user agent
  
  // Metadata
  createdBy?: string             // User who created the key
  notes?: string                 // Internal notes
  tags?: Tag[]                   // Organization tags
  createdAt: Date                // Creation timestamp
  updatedAt: Date                // Last update timestamp
}
```

### Key Types

```typescript
type KeyType = 
  | 'general'      // General API access
  | 'mcp'          // MCP server integration
  | 'mobile'       // Mobile application
  | 'integration'  // Third-party integration
  | 'development'  // Development/testing
  | 'webhook'      // Webhook endpoints
```

### Permissions

```typescript
type Permission = 
  | 'read'    // Read access to collections
  | 'write'   // Create/update access
  | 'delete'  // Delete access
  | 'admin'   // Administrative access
  | 'debug'   // Debug endpoint access
```

## API Endpoints

### Admin API Endpoints

All admin endpoints require authentication with admin-level API key.

#### List API Keys
```http
GET /api/admin/api-keys?action=list
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `keyType` - Filter by key type
- `isEnabled` - Filter by enabled status
- `search` - Search in name/description

**Response:**
```json
{
  "success": true,
  "data": {
    "docs": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Mobile App Key",
        "keyType": "mobile",
        "isEnabled": true,
        "usageCount": 1250,
        "lastUsed": "2025-01-06T10:30:00Z",
        "keyPreview": "a1b2c3d4..."
      }
    ],
    "totalDocs": 15,
    "page": 1,
    "totalPages": 2
  }
}
```

#### Create API Key
```http
POST /api/admin/api-keys
```

**Request Body:**
```json
{
  "action": "create",
  "name": "New Integration Key",
  "description": "Key for third-party integration",
  "keyType": "integration",
  "permissions": ["read", "write"],
  "allowedIPs": [
    { "ip": "192.168.1.100" },
    { "ip": "10.0.0.0/24" }
  ],
  "rateLimit": {
    "enabled": true,
    "requestsPerHour": 1000,
    "requestsPerMinute": 60
  },
  "expiresAt": "2025-12-31T23:59:59Z",
  "tags": [
    { "tag": "production" },
    { "tag": "integration" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "key": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    "message": "API key created successfully"
  }
}
```

#### Rotate API Key
```http
POST /api/admin/api-keys
```

**Request Body:**
```json
{
  "action": "rotate",
  "keyId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

#### Validate API Key
```http
POST /api/admin/api-keys
```

**Request Body:**
```json
{
  "action": "validate",
  "key": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  "clientIP": "192.168.1.100"
}
```

#### Update API Key
```http
PUT /api/admin/api-keys
```

**Request Body:**
```json
{
  "keyId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "Updated Key Name",
  "permissions": ["read", "write", "debug"],
  "isEnabled": false
}
```

#### Delete API Key
```http
DELETE /api/admin/api-keys?keyId=64f8a1b2c3d4e5f6a7b8c9d0
```

### Statistics Endpoint

#### Get Key Statistics
```http
GET /api/admin/api-keys?action=statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "enabled": 20,
    "disabled": 5,
    "expired": 2
  }
}
```

## Usage Examples

### Creating API Keys

#### Development Key
```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "name": "Development Testing",
    "keyType": "development",
    "permissions": ["read", "write", "debug"],
    "rateLimit": {
      "enabled": true,
      "requestsPerHour": 500,
      "requestsPerMinute": 30
    }
  }' \
  https://api.flow-masters.ru/api/admin/api-keys
```

#### Production Integration Key
```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "name": "Production CRM Integration",
    "keyType": "integration",
    "permissions": ["read", "write"],
    "allowedIPs": [
      { "ip": "203.0.113.10" },
      { "ip": "203.0.113.0/24" }
    ],
    "rateLimit": {
      "enabled": true,
      "requestsPerHour": 2000,
      "requestsPerMinute": 100
    },
    "expiresAt": "2025-12-31T23:59:59Z"
  }' \
  https://api.flow-masters.ru/api/admin/api-keys
```

### Managing Keys

#### List All Keys
```bash
curl -H "Authorization: Bearer $ADMIN_KEY" \
  "https://api.flow-masters.ru/api/admin/api-keys?action=list&limit=20"
```

#### Filter by Type
```bash
curl -H "Authorization: Bearer $ADMIN_KEY" \
  "https://api.flow-masters.ru/api/admin/api-keys?action=list&keyType=mobile"
```

#### Search Keys
```bash
curl -H "Authorization: Bearer $ADMIN_KEY" \
  "https://api.flow-masters.ru/api/admin/api-keys?action=list&search=integration"
```

#### Rotate Key
```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "rotate",
    "keyId": "64f8a1b2c3d4e5f6a7b8c9d0"
  }' \
  https://api.flow-masters.ru/api/admin/api-keys
```

## Security Best Practices

### Key Generation
- ✅ Use cryptographically secure random generation
- ✅ Minimum 256-bit (32 byte) key length
- ✅ Store only hashed versions in database
- ✅ Never log or expose keys in plain text

### Access Control
- ✅ Implement IP restrictions for production keys
- ✅ Use least privilege principle for permissions
- ✅ Set appropriate expiration dates
- ✅ Regular key rotation for critical integrations

### Monitoring
- ✅ Monitor unusual usage patterns
- ✅ Alert on failed authentication attempts
- ✅ Track key usage statistics
- ✅ Regular security audits

### Key Lifecycle
- ✅ Document key purposes and owners
- ✅ Regular review of active keys
- ✅ Prompt revocation of unused keys
- ✅ Secure key distribution methods

## Integration Examples

### JavaScript/Node.js
```javascript
import { ApiKeyManager } from '@flow-masters/api-client'

const keyManager = new ApiKeyManager({
  adminKey: process.env.ADMIN_API_KEY,
  baseURL: 'https://api.flow-masters.ru'
})

// Create a new key
const newKey = await keyManager.createKey({
  name: 'Mobile App v2.0',
  keyType: 'mobile',
  permissions: ['read', 'write'],
  rateLimit: {
    enabled: true,
    requestsPerHour: 1000,
    requestsPerMinute: 60
  }
})

console.log('New API key:', newKey.key)
```

### Python
```python
from flow_masters import ApiKeyManager

key_manager = ApiKeyManager(
    admin_key=os.getenv('ADMIN_API_KEY'),
    base_url='https://api.flow-masters.ru'
)

# List all keys
keys = key_manager.list_keys(key_type='integration')

# Rotate a key
new_key = key_manager.rotate_key(key_id='64f8a1b2c3d4e5f6a7b8c9d0')
```

## Testing

### Automated Testing
```bash
# Run comprehensive API key management tests
node scripts/test-api-key-management.mjs
```

### Manual Testing
```bash
# Test key creation
curl -X POST \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"create","name":"Test Key","keyType":"development"}' \
  https://api.flow-masters.ru/api/admin/api-keys

# Test key validation
curl -X POST \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"validate","key":"YOUR_TEST_KEY"}' \
  https://api.flow-masters.ru/api/admin/api-keys
```

## Monitoring and Analytics

### Key Usage Metrics
- Request count per key
- Success/failure rates
- Geographic usage patterns
- Peak usage times

### Security Metrics
- Failed authentication attempts
- IP restriction violations
- Expired key usage attempts
- Unusual usage patterns

### Performance Metrics
- Authentication response times
- Database query performance
- Rate limiting effectiveness
- System resource usage

## Troubleshooting

### Common Issues

#### Key Not Working
1. Check if key is enabled
2. Verify IP restrictions
3. Check expiration date
4. Validate permissions

#### Rate Limiting
1. Check current usage against limits
2. Verify rate limit configuration
3. Consider increasing limits if needed

#### Authentication Errors
1. Verify key format (Bearer vs x-api-key)
2. Check for typos in key
3. Ensure proper headers

### Debug Commands
```bash
# Check key status
curl -H "Authorization: Bearer $ADMIN_KEY" \
  "https://api.flow-masters.ru/api/admin/api-keys?action=list&search=YOUR_KEY_NAME"

# Validate specific key
curl -X POST \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"validate","key":"YOUR_KEY","clientIP":"YOUR_IP"}' \
  https://api.flow-masters.ru/api/admin/api-keys
```

## Support

### Documentation
- **API Reference**: [https://docs.flow-masters.ru/api-keys](https://docs.flow-masters.ru/api-keys)
- **Security Guide**: [https://docs.flow-masters.ru/security](https://docs.flow-masters.ru/security)

### Support Channels
- **Email**: api-support@flow-masters.ru
- **GitHub**: [https://github.com/flow-masters/api-issues](https://github.com/flow-masters/api-issues)

---

**Last Updated**: 2025-01-06  
**Version**: 2.0  
**Next Review**: 2025-02-06

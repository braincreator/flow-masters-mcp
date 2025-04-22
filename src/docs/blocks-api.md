# Blocks API Documentation

The Blocks API provides information about all available blocks that can be used in page templates. This API is particularly useful for MCP (Model Context Protocol) to get information about blocks for landing page generation.

## Endpoint

```
GET /api/v1/blocks
```

## Authentication

This endpoint requires API key authentication. Include your API key in the request headers:

```
x-api-key: your-api-key-here
```

Note: In development mode, API key authentication is disabled.

## Response

The response is a JSON object with the following structure:

```json
{
  "success": true,
  "data": [
    {
      "slug": "hero",
      "name": "Hero Block",
      "pluralName": "Hero Blocks",
      "interfaceName": "HeroBlock",
      "description": "Главный блок страницы с заголовком, подзаголовком, изображением и кнопками",
      "category": "Basic",
      "fields": [
        {
          "name": "heading",
          "type": "text",
          "required": false
        },
        {
          "name": "subheading",
          "type": "text",
          "required": false
        },
        // ... other fields
      ],
      "example": {
        "blockType": "hero",
        "heading": "Заголовок Hero блока",
        "subheading": "Подзаголовок с кратким описанием",
        // ... example data
      }
    },
    // ... other blocks
  ]
}
```

### Block Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `slug` | string | Unique identifier for the block |
| `name` | string | Human-readable name (singular) |
| `pluralName` | string | Human-readable name (plural) |
| `interfaceName` | string | TypeScript interface name (if available) |
| `description` | string | Description of the block's purpose and functionality |
| `category` | string | Category the block belongs to (e.g., "Basic", "Media", "Functional") |
| `fields` | array | List of fields/properties the block accepts |
| `example` | object | Example usage of the block |

### Field Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Field name |
| `type` | string | Field type (e.g., "text", "richText", "select") |
| `required` | boolean | Whether the field is required |
| `options` | array | Available options (for select fields) |
| `defaultValue` | any | Default value (if applicable) |

## Error Responses

| Status Code | Description |
|-------------|-------------|
| 401 | Missing API key |
| 403 | Invalid or disabled API key |
| 500 | Server error |

## Example Usage

### Request

```bash
curl -X GET https://your-domain.com/api/v1/blocks \
  -H "x-api-key: your-api-key-here" \
  -H "Content-Type: application/json"
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "slug": "hero",
      "name": "Hero Block",
      "pluralName": "Hero Blocks",
      "description": "Главный блок страницы с заголовком, подзаголовком, изображением и кнопками",
      "category": "Basic",
      "fields": [
        {
          "name": "heading",
          "type": "text",
          "required": false
        },
        {
          "name": "subheading",
          "type": "text",
          "required": false
        },
        {
          "name": "media",
          "type": "upload",
          "required": false
        },
        {
          "name": "actions",
          "type": "array",
          "required": false
        }
      ],
      "example": {
        "blockType": "hero",
        "heading": "Заголовок Hero блока",
        "subheading": "Подзаголовок с кратким описанием",
        "media": {
          "type": "image",
          "url": "/images/example-hero.jpg",
          "alt": "Описание изображения"
        },
        "actions": [
          {
            "label": "Основная кнопка",
            "href": "/action",
            "variant": "primary"
          },
          {
            "label": "Вторичная кнопка",
            "href": "/learn-more",
            "variant": "secondary"
          }
        ]
      }
    }
  ]
}
```

## Using with MCP

This endpoint is designed to be used with the MCP (Model Context Protocol) server to provide context for AI models when generating landing pages. The MCP server can call this endpoint to get information about available blocks and their properties, which can then be used to generate structured content.

Example MCP integration:

```javascript
// In MCP server code
async function getAvailableBlocks() {
  const response = await fetch('http://your-domain.com/api/v1/blocks', {
    headers: {
      'x-api-key': process.env.API_KEY,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch blocks');
  }
  
  const data = await response.json();
  return data.data;
}

// Use the blocks data to provide context to AI models
async function generateLandingPage(topic) {
  const blocks = await getAvailableBlocks();
  
  // Format blocks for AI context
  const blocksContext = blocks.map(block => 
    `${block.name}: ${block.description}\nFields: ${block.fields.map(f => f.name).join(', ')}\n`
  ).join('\n');
  
  // Provide context to AI model
  const aiPrompt = `
    Create a landing page about "${topic}".
    
    Available blocks:
    ${blocksContext}
    
    Return a JSON structure with the selected blocks and their content.
  `;
  
  // Call AI model with the prompt
  // ...
}
```

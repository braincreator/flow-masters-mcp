const http = require('http');

// Configuration
const PORT = process.env.PORT || 3030;
const HOST = process.env.HOST || '0.0.0.0';
const API_URL = process.env.API_URL || 'http://payload:3000';
const API_KEY = process.env.API_KEY || 'your-api-key-here';

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  
  // Set content type to JSON
  res.setHeader('Content-Type', 'application/json');
  
  // Parse URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  // Handle different endpoints
  if (path === '/mcp/health') {
    // Health check endpoint
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      version: '1.0.0',
      message: 'MCP server is running',
      apiStatus: 'unknown'
    }));
  } else if (path === '/mcp/version') {
    // Version endpoint
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      version: '1.0.0',
      apiVersion: '1.0.0'
    }));
  } else if (path === '/mcp/context' && req.method === 'POST') {
    // Model context endpoint
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { query, model } = JSON.parse(body);
        
        if (!query) {
          res.statusCode = 400;
          res.end(JSON.stringify({
            success: false,
            message: 'Query is required'
          }));
          return;
        }
        
        res.statusCode = 200;
        res.end(JSON.stringify({
          success: true,
          context: `This is a model context for query: ${query}`,
          model: model || 'default',
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({
          success: false,
          message: 'Error processing context request',
          error: error.message
        }));
      }
    });
  } else {
    // Root or unknown endpoint
    res.statusCode = 200;
    res.end(JSON.stringify({
      name: 'Flow Masters MCP Server',
      description: 'Model Context Protocol server for Flow Masters API',
      endpoints: [
        '/mcp/health',
        '/mcp/version',
        '/mcp/context'
      ]
    }));
  }
});

// Start the server
server.listen(Number(PORT), HOST, () => {
  console.log(`MCP server running at http://${HOST}:${PORT}`);
  console.log(`Connected to API at ${API_URL}`);
});

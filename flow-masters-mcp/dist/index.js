"use strict";
const express = require('express');
const axios = require('axios');

// Configuration
const PORT = process.env.PORT || 3030;
const HOST = process.env.HOST || '0.0.0.0';
const API_URL = process.env.API_URL || 'http://payload:3000';
const API_KEY = process.env.API_KEY || 'your-api-key-here';

// Create Express app
const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get('/mcp/health', async (req, res) => {
  try {
    // Test connection to API
    const response = await axios.get(`${API_URL}/api/status`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    }).catch(() => ({ status: 500 }));
    
    res.json({
      success: true,
      version: '1.0.0',
      message: 'MCP server is running',
      apiStatus: response.status === 200 ? 'connected' : 'error'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      version: '1.0.0',
      message: 'Error connecting to API',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Version endpoint
app.get('/mcp/version', (req, res) => {
  res.json({
    success: true,
    version: '1.0.0',
    apiVersion: '1.0.0'
  });
});

// Model context endpoint
app.post('/mcp/context', async (req, res) => {
  try {
    const { query, model } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }
    
    res.json({
      success: true,
      context: `This is a model context for query: ${query}`,
      model: model || 'default',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing context request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Flow Masters MCP Server',
    description: 'Model Context Protocol server for Flow Masters API',
    endpoints: [
      '/mcp/health',
      '/mcp/version',
      '/mcp/context'
    ]
  });
});

// Start the server
app.listen(Number(PORT), HOST, () => {
  console.log(`MCP server running at http://${HOST}:${PORT}`);
  console.log(`Connected to API at ${API_URL}`);
});

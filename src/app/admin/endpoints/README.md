# API Endpoints Browser

The API Endpoints Browser provides easy access to all available API endpoints in the Flow Masters application. This tool allows administrators and developers to:

1. Browse all available API endpoints
2. Search and filter endpoints by type, method, and keywords
3. Test endpoints directly from the browser
4. View detailed information about each endpoint

## Features

- **Endpoint Listing**: View all available endpoints from both the main API and the MCP server
- **Filtering**: Filter endpoints by type (API, MCP, Other) and HTTP method (GET, POST, PUT, etc.)
- **Search**: Search endpoints by path or description
- **Testing**: Test endpoints directly from the browser with a built-in request builder
- **Documentation**: View detailed information about each endpoint, including parameters and security requirements

## How to Use

1. Navigate to the API Endpoints Browser from the admin panel sidebar under "Development"
2. Browse the list of available endpoints
3. Use the search and filter options to find specific endpoints
4. Click the "Test" button on any endpoint to open the endpoint tester
5. In the tester, you can:
   - Modify the request method and path
   - Add request body for POST/PUT/PATCH requests
   - Send the request and view the response

## Refreshing Endpoints

The MCP server automatically scans for endpoints, but you can manually refresh the list by clicking the "Refresh Endpoints" button at the top of the page. This will trigger a new scan of the API and update the list of available endpoints.

## Security

- Testing endpoints that require authentication will only work if you are logged in
- Some sensitive operations (like refreshing endpoints) require admin privileges
- All requests are proxied through the server to avoid CORS issues and to ensure proper authentication
- Communication between the application and the MCP server is secured using the Payload secret key
- The MCP server authenticates API requests using the same Payload secret

## Troubleshooting

If you encounter any issues with the Endpoints Browser:

1. Check that the MCP server is running and accessible
2. Verify that you have the necessary permissions to access the endpoints
3. Check the browser console for any error messages
4. Try refreshing the endpoints list

For more information, contact the system administrator.

import { NextResponse } from 'next/server'

// Этот файл автоматически создан скриптом миграции API
// Редирект со старого API пути на новый v1 путь

// Helper function to construct the correct v1 URL
function rewriteUrl(request: Request): string {
  const url = new URL(request.url)
  // Example pathname: /api/globals/header
  // We need to extract everything after /api/globals/
  const basePath = '/api/globals/'
  const actualParams = url.pathname.startsWith(basePath)
    ? url.pathname.substring(basePath.length)
    : '' // Handle cases where the path might not match expected format

  // Construct the new URL
  const newUrl = `${url.origin}/api/v1/globals/${actualParams}${url.search}`
  return newUrl
}

export function GET(request: Request) {
  const newUrl = rewriteUrl(request)
  console.log(`Redirecting GET from ${request.url} to ${newUrl}`) // Added logging for debugging
  return NextResponse.redirect(newUrl)
}

export function POST(request: Request) {
  const newUrl = rewriteUrl(request)
  console.log(`Redirecting POST from ${request.url} to ${newUrl}`) // Added logging for debugging
  return NextResponse.redirect(newUrl)
}

export function PUT(request: Request) {
  const newUrl = rewriteUrl(request)
  console.log(`Redirecting PUT from ${request.url} to ${newUrl}`) // Added logging for debugging
  return NextResponse.redirect(newUrl)
}

export function DELETE(request: Request) {
  const newUrl = rewriteUrl(request)
  console.log(`Redirecting DELETE from ${request.url} to ${newUrl}`) // Added logging for debugging
  return NextResponse.redirect(newUrl)
}

// OPTIONS doesn't typically need a redirect body, just headers
export function OPTIONS(request: Request) {
  // You might want to adjust allowed origins, methods, headers based on your needs
  const headers = {
    'Access-Control-Allow-Origin': '*', // Or specific origins
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Add other headers if needed
    'Access-Control-Max-Age': '86400', // Cache preflight response for 1 day
  }
  return new NextResponse(null, { status: 204, headers }) // Use 204 No Content for OPTIONS
}

import { NextRequest, NextResponse } from 'next/server'

/**
 * Автоматически созданный редирект для миграции API
 * Перенаправляет запросы с /api/v1/templates на /api/templates
 */

function createRedirect(request: NextRequest) {
  const url = new URL(request.url)
  const newPath = url.pathname.replace('/api/v1/templates', '/api/templates')
  const newUrl = `${url.origin}${newPath}${url.search}`
  
  return NextResponse.redirect(newUrl, 301) // Permanent redirect
}

export const GET = createRedirect
export const POST = createRedirect
export const PUT = createRedirect
export const DELETE = createRedirect
export const PATCH = createRedirect
export const OPTIONS = createRedirect

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from '@/utilities/revalidation'

// Этот файл автоматически создан скриптом миграции API
// Редирект со старого API пути на новый v1 путь

export function GET(request: Request) {
  const url = new URL(request.url)
  const newUrl = `${url.origin}/api/v1/revalidate${url.pathname.replace('/api/revalidate', '')}${url.search}`
  return NextResponse.redirect(newUrl)
}

export function POST(request: Request) {
  const url = new URL(request.url)
  const newUrl = `${url.origin}/api/v1/revalidate${url.pathname.replace('/api/revalidate', '')}${url.search}`
  return NextResponse.redirect(newUrl)
}

export function PUT(request: Request) {
  const url = new URL(request.url)
  const newUrl = `${url.origin}/api/v1/revalidate${url.pathname.replace('/api/revalidate', '')}${url.search}`
  return NextResponse.redirect(newUrl)
}

export function DELETE(request: Request) {
  const url = new URL(request.url)
  const newUrl = `${url.origin}/api/v1/revalidate${url.pathname.replace('/api/revalidate', '')}${url.search}`
  return NextResponse.redirect(newUrl)
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

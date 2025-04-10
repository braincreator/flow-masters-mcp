
import { NextResponse } from 'next/server';

// Этот файл автоматически создан скриптом миграции API
// Редирект со старого API пути на новый v1 путь

export function GET(request: Request) {
  const url = new URL(request.url);
  const newUrl = `${url.origin}/api/v1/payment/verify${url.pathname.replace('/api/payment/verify', '')}${url.search}`;
  return NextResponse.redirect(newUrl);
}

export function POST(request: Request) {
  const url = new URL(request.url);
  const newUrl = `${url.origin}/api/v1/payment/verify${url.pathname.replace('/api/payment/verify', '')}${url.search}`;
  return NextResponse.redirect(newUrl);
}

export function PUT(request: Request) {
  const url = new URL(request.url);
  const newUrl = `${url.origin}/api/v1/payment/verify${url.pathname.replace('/api/payment/verify', '')}${url.search}`;
  return NextResponse.redirect(newUrl);
}

export function DELETE(request: Request) {
  const url = new URL(request.url);
  const newUrl = `${url.origin}/api/v1/payment/verify${url.pathname.replace('/api/payment/verify', '')}${url.search}`;
  return NextResponse.redirect(newUrl);
}

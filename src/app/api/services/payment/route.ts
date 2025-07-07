// DEPRECATED: This endpoint has been replaced by /api/orders
// Please update any clients to use the new unified endpoint.
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/services/payment
 * @deprecated This endpoint has been replaced by /api/orders.
 * Создание платежа для услуги
 */
export async function POST(request: NextRequest) {
  // Construct new URL based on current request
  const newUrl = new URL('/api/orders', request.url);
  return NextResponse.redirect(newUrl.toString(), {
    status: 308,
    headers: {
      'Content-Type': 'application/json',
    },
    // Including a body with NextResponse.redirect requires a workaround or custom Response.
    // For simplicity and standard compliance, a redirect typically doesn't have a body.
    // If a body is strictly needed with the redirect status, a custom Response is better:
    // return new Response(JSON.stringify({ message: "This endpoint is deprecated. Please use /api/orders.", newEndpoint: "/api/orders" }), {
    //   status: 308,
    //   headers: {
    //     'Location': newUrl.toString(),
    //     'Content-Type': 'application/json',
    //   },
    // });
  });

  // Alternative: Return 410 Gone with a JSON body
  // return NextResponse.json(
  //   { message: "This endpoint is deprecated and has been removed. Please use /api/orders.", newEndpoint: "/api/orders" },
  //   { status: 410 }
  // );
}

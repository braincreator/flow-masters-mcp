// DEPRECATED: This endpoint has been replaced by /api/v1/orders
// Please update any clients to use the new unified endpoint.
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Construct new URL based on current request
  const newUrl = new URL('/api/v1/orders', req.url);
  return NextResponse.redirect(newUrl.toString(), {
    status: 308,
    headers: {
      'Content-Type': 'application/json',
    },
    // Including a body with NextResponse.redirect requires a workaround or custom Response.
    // For simplicity and standard compliance, a redirect typically doesn't have a body.
    // If a body is strictly needed with the redirect status, a custom Response is better:
    // return new Response(JSON.stringify({ message: "This endpoint is deprecated. Please use /api/v1/orders.", newEndpoint: "/api/v1/orders" }), {
    //   status: 308,
    //   headers: {
    //     'Location': newUrl.toString(),
    //     'Content-Type': 'application/json',
    //   },
    // });
  });

  // Alternative: Return 410 Gone with a JSON body
  // return NextResponse.json(
  //   { message: "This endpoint is deprecated and has been removed. Please use /api/v1/orders.", newEndpoint: "/api/v1/orders" },
  //   { status: 410 }
  // );
}

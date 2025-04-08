/* THIS FILE WAS MODIFIED TO FIX BUILD ERRORS */
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'
import { getPayloadClient } from '@/utilities/payload'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayloadClient({
      config,
      req,
    })

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GraphQL Playground</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, minimal-ui" />
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/graphql-playground-react@1.7.42/build/static/css/index.css" />
          <script src="https://cdn.jsdelivr.net/npm/graphql-playground-react@1.7.42/build/static/js/middleware.js"></script>
        </head>
        <body>
          <div id="root">
            <style>
              body {
                background-color: rgb(23, 42, 58);
                font-family: Open Sans, sans-serif;
                height: 90vh;
              }
              #root {
                height: 100%;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .loading {
                font-size: 32px;
                font-weight: 200;
                color: rgba(255, 255, 255, .6);
                margin-left: 20px;
              }
              img {
                width: 78px;
                height: 78px;
              }
              .title {
                font-weight: 400;
              }
            </style>
            <img src='https://cdn.jsdelivr.net/npm/graphql-playground-react@1.7.42/build/logo.png' alt='GraphQL Playground'>
            <div class="loading"> Loading
              <span class="title">GraphQL Playground</span>
            </div>
          </div>
          <script>window.addEventListener('load', function (event) {
              GraphQLPlayground.init(document.getElementById('root'), {
                endpoint: '/api/graphql',
                settings: {
                  'request.credentials': 'include',
                },
              })
            })</script>
        </body>
      </html>
    `

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

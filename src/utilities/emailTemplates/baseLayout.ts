interface BaseLayoutData {
  locale?: string
  siteUrl?: string
  pageTitle: string
  bodyContent: string
  footerContent?: string
}

export const generateBaseEmailLayout = (data: BaseLayoutData): string => {
  const {
    locale = 'ru',
    siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flow-masters.ru',
    pageTitle,
    bodyContent,
    footerContent = `<p>© ${new Date().getFullYear()} Flow Masters</p>`,
  } = data

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <style>
    /* Общие стили для всех писем */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      padding: 0;
      background-color: #ffffff;
      border: 1px solid #eaeaea;
      border-radius: 5px;
      overflow: hidden; /* Ensure border-radius clips content */
    }
    .email-header {
      text-align: center;
      padding: 25px 20px;
      background-color: #f8f8f8; /* Slightly different bg for header */
      border-bottom: 1px solid #eaeaea;
    }
    .email-logo {
      max-width: 150px;
      height: auto;
    }
    .email-content {
      padding: 30px 30px; /* More padding for content */
    }
    .email-footer {
      padding: 20px 30px;
      text-align: center;
      color: #666;
      font-size: 12px;
      background-color: #f8f8f8;
      border-top: 1px solid #eaeaea;
    }
    .button {
      display: inline-block;
      padding: 12px 25px;
      background-color: #0070f3;
      color: white !important; /* Ensure button text is white */
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
      text-align: center;
    }
    .unsubscribe-link {
      color: #666;
      font-size: 12px;
      margin-top: 15px;
      display: block;
    }
    a {
      color: #0070f3;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    h1 {
      margin-top: 0;
      color: #111;
    }
    p {
        margin-bottom: 1em;
    }
    hr {
        border: none;
        border-top: 1px solid #eaeaea;
        margin: 25px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="${siteUrl}/logo.png" alt="Flow Masters Logo" class="email-logo">
    </div>
    <div class="email-content">
      ${bodyContent}
    </div>
    <div class="email-footer">
      ${footerContent}
    </div>
  </div>
</body>
</html>
  `
}

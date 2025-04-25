# Using Lexical Editor Content in Email Templates

This guide explains how to use Lexical editor content from Payload CMS in email templates.

## Overview

The Flow Masters platform now supports rich text content from the Lexical editor in all email templates. This allows you to create rich, formatted content in the admin panel and send it directly in emails without losing formatting.

## How It Works

1. The system uses a dedicated utility function (`lexicalToHtml`) to convert Lexical editor content to HTML
2. This conversion happens automatically when you pass Lexical content to email templates
3. All email templates and email-sending methods have been updated to support both plain text and Lexical content

## Using Lexical Content in Emails

### In Newsletter Broadcasts

When sending a newsletter broadcast, you can now pass Lexical content directly:

```typescript
// Example: Sending a newsletter with Lexical content
const lexicalContent = await payload.findByID({
  collection: 'email-templates',
  id: templateId,
});

// The content field contains Lexical data
const emailService = ServiceRegistry.getInstance(payload).getEmailService();
await emailService.sendBroadcast(
  'Newsletter Title',
  lexicalContent.body, // This can be Lexical content
  'en'
);
```

### In Email Templates

When creating email templates in the admin panel, you can use the Lexical editor for the body content. The system will automatically convert this to HTML when sending emails.

### In Custom Email Functions

If you're creating custom email functions, you can use the `lexicalToHtml` utility directly:

```typescript
import { lexicalToHtml } from '../utilities/lexicalToHtml';

// Convert Lexical content to HTML
const htmlContent = lexicalToHtml(lexicalContent);
```

## Supported Lexical Features

The following Lexical features are supported in email templates:

- **Text Formatting**: Bold, italic, underline, strikethrough, code
- **Block Elements**: Paragraphs, headings (h1-h6)
- **Lists**: Ordered and unordered lists
- **Links**: Regular and new tab links
- **Quotes**: Blockquotes
- **Code Blocks**: Formatted code blocks
- **Horizontal Rules**: Dividers
- **Images**: With alt text and dimensions
- **Custom Blocks**: Basic support for banner, media, and code blocks

## Email Client Compatibility

The generated HTML is designed to be compatible with most email clients. However, some advanced formatting may not be supported in all email clients. We recommend testing your emails in various clients to ensure they display correctly.

## Best Practices

1. **Keep it Simple**: While the system supports rich formatting, it's best to keep email content simple for maximum compatibility
2. **Test Your Emails**: Always test your emails in different email clients to ensure they display correctly
3. **Use Preview Mode**: Use the preview mode in the admin panel to see how your content will look before sending
4. **Fallback Text**: Always provide plain text alternatives for important content

## Troubleshooting

If you encounter issues with Lexical content in emails:

1. **Check the Console**: Look for any errors in the server console
2. **Inspect the HTML**: Use the `lexicalToHtml` function to convert your content and inspect the resulting HTML
3. **Simplify Content**: Try simplifying your content to identify which elements might be causing issues
4. **Update the Converter**: If you need support for additional Lexical features, update the `lexicalToHtml` utility

## Technical Details

The conversion from Lexical to HTML happens in the `src/utilities/lexicalToHtml.ts` file. This utility:

1. Normalizes the Lexical content structure
2. Processes each node type (text, paragraph, heading, etc.)
3. Applies appropriate HTML formatting
4. Handles nested structures recursively

If you need to extend the functionality, this is the file to modify.

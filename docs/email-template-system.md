# Email Template System Documentation

This document provides a comprehensive guide to the email template system in the Flow Masters platform.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Using the Email Template System](#using-the-email-template-system)
4. [Syncing Code Templates to CMS](#syncing-code-templates-to-cms)
5. [Creating Custom Templates](#creating-custom-templates)
6. [Best Practices](#best-practices)
7. [Migration Guide](#migration-guide)

## Overview

The Flow Masters platform uses a hybrid email template system that combines the best of both worlds:

1. **Code-based templates** - TypeScript classes that provide type safety and programmatic control
2. **CMS-based templates** - Editable templates stored in Payload CMS that can be modified by non-developers

The system automatically tries to use a CMS template first, and falls back to a code-based template if the CMS template is not found.

## Architecture

### Components

1. **Base Email Templates** - TypeScript classes in `src/utilities/emailTemplates/`
2. **Email Template Types** - TypeScript interfaces in `src/types/emailTemplates.ts`
3. **Enhanced Email Service** - Service that handles sending emails in `src/services/email.service.ts` with support for both CMS and code templates
4. **Template Sync Script** - Script to sync code templates to CMS in `src/scripts/sync-email-templates.ts`

### Flow

1. When sending an email, the `EmailService` is used
2. The service first tries to find a template in the CMS by its slug
3. If found, it uses the CMS template with the provided data
4. If not found, it falls back to the corresponding code-based template
5. The email is sent using the selected template

## Using the Email Template System

### Basic Usage

```typescript
import { ServiceRegistry } from '@/services/service.registry';
import { EmailTemplateSlug } from '@/types/emailTemplates';

// Get the email service
const emailService = ServiceRegistry.getInstance(payload).getEmailService();

// Send a welcome email
await emailService.sendWelcomeEmail({
  email: 'user@example.com',
  name: 'John Doe',
  locale: 'en',
  unsubscribeToken: 'abc123'
});

// Send a course enrollment email
await emailService.sendCourseEnrollmentEmail({
  userName: 'John Doe',
  email: 'user@example.com',
  courseName: 'Introduction to Flow Masters',
  courseId: 'course123',
  locale: 'en'
});
```

### Using Template Slugs Directly

You can also use template slugs directly with the `sendTemplateEmail` method:

```typescript
// Send an email using a template slug
await emailService.sendTemplateEmail(
  EmailTemplateSlug.WELCOME,
  'user@example.com',
  {
    name: 'John Doe',
    locale: 'en',
    unsubscribeToken: 'abc123',
    siteUrl: 'https://flow-masters.ru'
  },
  { locale: 'en' }
);
```

### Custom Templates

You can also send emails using custom templates that only exist in the CMS:

```typescript
// Send an email using a custom template
await emailService.sendTemplateEmail(
  'my-custom-template',
  'user@example.com',
  {
    locale: 'en',
    // Add any other data needed for the template
    customField1: 'value1',
    customField2: 'value2'
  },
  { locale: 'en' }
);
```

### Using Helper Functions for Complex Templates

For more complex email templates, you can use the helper functions in `emailTemplateHelpers.ts`:

```typescript
import {
  generateTable,
  generateList,
  generateButton,
  conditionalSection,
  formatCurrency,
  formatDate
} from '@/utilities/emailTemplateHelpers';

// Generate an order confirmation email with a table of items
const orderItems = [
  { name: 'Course 1', price: 99.99, quantity: 1 },
  { name: 'Course 2', price: 149.99, quantity: 1 }
];

// Generate a table of order items
const itemsTable = generateTable(orderItems, [
  { key: 'name', header: 'Product', width: '60%' },
  {
    key: 'price',
    header: 'Price',
    width: '20%',
    align: 'right',
    format: (value) => formatCurrency(value, 'USD', 'en')
  },
  {
    key: 'quantity',
    header: 'Qty',
    width: '10%',
    align: 'center'
  },
  {
    key: (item) => item.price * item.quantity,
    header: 'Total',
    width: '20%',
    align: 'right',
    format: (value) => formatCurrency(value, 'USD', 'en')
  }
]);

// Generate a list of benefits
const benefitsList = generateList(
  ['24/7 Support', 'Lifetime Access', 'Certificate of Completion'],
  'ul',
  (item) => `<strong>${item}</strong>`
);

// Generate a button
const viewOrderButton = generateButton(
  'View Order',
  `https://flow-masters.ru/orders/ORD-12345`,
  { backgroundColor: '#0070f3', textColor: 'white', align: 'center' }
);

// Generate conditional content
const discountSection = conditionalSection(
  orderData.discount > 0,
  `<p>You saved ${formatCurrency(orderData.discount, 'USD', 'en')}!</p>`,
  ''
);

// Format a date
const formattedDate = formatDate(new Date(), 'en', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});
```

### Previewing Email Templates

You can preview email templates using the preview endpoints:

```typescript
// Preview an email template with sample data
const response = await fetch('/api/preview-email-template', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    slug: 'welcome-email',
    data: {
      name: 'John Doe',
      email: 'user@example.com',
      locale: 'en'
    },
    locale: 'en'
  })
});

const preview = await response.json();

// Open the preview URL in a new window
window.open(preview.previewUrl, '_blank');
```

## Syncing Code Templates to CMS

The system includes a script to sync code-based templates to the CMS. This is useful for:

1. Initial setup of the CMS templates
2. Updating CMS templates when code templates change
3. Ensuring consistency between code and CMS templates

### Running the Sync Script

```bash
# Run the sync script
npm run sync:email-templates
```

### What the Sync Script Does

1. Reads the code-based templates
2. Generates sample HTML using sample data
3. Extracts placeholders from the HTML
4. Creates or updates templates in the CMS
5. Marks the templates as synced from code

## Creating Custom Templates

### Creating a CMS-only Template

1. Go to your Payload admin panel
2. Navigate to "Marketing & Communications" > "Email Templates"
3. Click "Create New"
4. Fill in the details:
   - **Name**: Name for admin reference
   - **Slug**: Unique identifier for code reference
   - **Template Type**: Category of the template
   - **Sender**: Email sender
   - **Subject**: Email subject (localized)
   - **Body**: Email body using the rich text editor (localized)
5. Use placeholders in your template with `{{variableName}}` syntax
6. Save the template

### Creating a Code-based Template

1. Create a new TypeScript file in the appropriate directory in `src/utilities/emailTemplates/`
2. Extend the `BaseEmailTemplate` class
3. Implement the `generateContent` method
4. Export a generator function
5. Add the template to the `index.ts` exports
6. Run the sync script to create the CMS version

## Best Practices

1. **Use the EmailService** for all email sending to benefit from the hybrid approach
2. **Use CMS templates** for emails that need frequent changes by non-developers
3. **Use code templates** for complex emails with dynamic content or special formatting
4. **Run the sync script** after making changes to code templates
5. **Document placeholders** in CMS templates

## Migration Guide

If you're migrating from an older version of the email system, follow these steps:

### Step 1: Sync Code Templates to CMS

Run the sync script to create CMS versions of all your code templates:

```bash
npm run sync:email-templates
```

### Step 2: Update Email Methods

If you have custom email methods that don't check for CMS templates first, update them to use the hybrid approach:

```typescript
async sendCustomEmail(data: CustomEmailData): Promise<boolean> {
  try {
    // First try to use a CMS template
    const cmsResult = await this.sendTemplateEmail(
      'custom-email-template',
      data.email,
      Object.fromEntries(Object.entries(data)),
      { locale: data.locale || 'ru' }
    );

    // If CMS template was found and email sent successfully, return
    if (cmsResult) return true;

    // Otherwise, fall back to the code-based template
    const html = generateCustomEmail(data);

    return await this.sendEmail({
      to: data.email,
      subject: 'Custom Email',
      html,
    });
  } catch (error) {
    console.error('Failed to send custom email:', error);
    return false;
  }
}
```

You can also use the provided script to update all email methods automatically:

```bash
npm run update:email-methods
```

### Step 3: Test the System

Test each email type to ensure it works with both CMS and code templates:

1. Send an email using the default method
2. Modify the CMS template
3. Send another email to verify the changes are applied
4. Delete the CMS template
5. Send another email to verify it falls back to the code template

## Conclusion

The hybrid email template system provides a flexible, type-safe, and user-friendly way to manage email templates in the Flow Masters platform. By combining the best of both code-based and CMS-based approaches, it allows for both developer efficiency and non-developer accessibility.

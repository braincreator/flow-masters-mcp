# Enhanced Email System Documentation

This document provides an overview of the enhanced email template system in the Flow Masters platform.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Using the Enhanced Email System](#using-the-enhanced-email-system)
4. [Syncing Code Templates to CMS](#syncing-code-templates-to-cms)
5. [Creating Custom Templates](#creating-custom-templates)
6. [Best Practices](#best-practices)

## Overview

The Flow Masters platform uses a hybrid email template system that combines the best of both worlds:

1. **Code-based templates** - Strongly typed TypeScript classes that provide type safety and programmatic control
2. **CMS-based templates** - Editable templates stored in Payload CMS that can be modified by non-developers

The enhanced email system automatically tries to use a CMS template first, and falls back to a code-based template if the CMS template is not found.

## Architecture

### Components

1. **Base Email Templates** - TypeScript classes in `src/utilities/emailTemplates/`
2. **Email Template Types** - TypeScript interfaces in `src/types/emailTemplates.ts`
3. **Enhanced Email Service** - Service that combines CMS and code templates in `src/services/enhancedEmail.service.ts`
4. **Template Sync Script** - Script to sync code templates to CMS in `src/scripts/sync-email-templates.ts`

### Flow

1. When sending an email, the `EnhancedEmailService` is used
2. The service first tries to find a template in the CMS by its slug
3. If found, it uses the CMS template with the provided data
4. If not found, it falls back to the corresponding code-based template
5. The email is sent using the selected template

## Using the Enhanced Email System

### Basic Usage

```typescript
import { ServiceRegistry } from '@/services/service.registry';
import { EmailTemplateSlug } from '@/types/emailTemplates';

// Get the enhanced email service
const emailService = ServiceRegistry.getInstance(payload).getEnhancedEmailService();

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

### Using Template Slugs

You can also use template slugs for more dynamic usage:

```typescript
import { EmailTemplateSlug } from '@/types/emailTemplates';

// Send a welcome email using the template slug
await emailService.sendTemplatedEmail(
  EmailTemplateSlug.WELCOME,
  {
    email: 'user@example.com',
    name: 'John Doe',
    locale: 'en',
    unsubscribeToken: 'abc123'
  }
);
```

### Custom Templates

You can also send emails using custom templates that only exist in the CMS:

```typescript
// Send an email using a custom template
await emailService.sendCustomEmail(
  'my-custom-template',
  {
    email: 'user@example.com',
    locale: 'en',
    // Add any other data needed for the template
    customField1: 'value1',
    customField2: 'value2'
  }
);
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
6. Add the template type to `src/types/emailTemplates.ts`
7. Add a method to the `EnhancedEmailService` class
8. Run the sync script to create the CMS version

## Best Practices

1. **Use the Enhanced Email Service** for all email sending to benefit from the hybrid approach
2. **Use CMS templates** for emails that need frequent changes by non-developers
3. **Use code templates** for complex emails with dynamic content or special formatting
4. **Run the sync script** after making changes to code templates
5. **Use the template types** for type safety
6. **Use the template slugs enum** for consistency
7. **Document placeholders** in CMS templates

## Conclusion

The enhanced email system provides a flexible, type-safe, and user-friendly way to manage email templates in the Flow Masters platform. By combining the best of both code-based and CMS-based approaches, it allows for both developer efficiency and non-developer accessibility.

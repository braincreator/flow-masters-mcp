# Email Templates Documentation

This document provides an overview of the email templates system in the Flow Masters platform.

## Table of Contents

1. [Architecture](#architecture)
2. [Available Templates](#available-templates)
3. [Using Email Templates](#using-email-templates)
4. [Localization](#localization)
5. [Lexical Content Support](#lexical-content-support)
6. [Customizing Templates](#customizing-templates)
7. [Testing Templates](#testing-templates)

## Architecture

The email template system is built on a modular, functional architecture:

### Template Generator Functions

All email templates are implemented as generator functions that:

- Common styling and layout
- Localization support
- Unsubscribe link handling
- Consistent header and footer
- Responsive design

### Template Structure

Each template follows this structure:

1. **Interface**: Defines the data required for the template
2. **Template Class**: Extends `BaseEmailTemplate` and implements the template logic
3. **Generator Function**: A convenience function to generate the HTML

### Directory Structure

```
src/utilities/emailTemplates/
├── index.ts                  # Central export point
├── baseEmailTemplate.ts      # Base template class
├── auth/                     # Authentication emails
│   ├── passwordReset.ts
│   ├── welcome.ts
│   └── unsubscribeConfirmation.ts
├── courses/                  # Course-related emails
│   ├── courseEnrollment.ts
│   ├── courseCompletion.ts
│   ├── courseProgress.ts
│   └── courseCertificate.ts
├── orders/                   # Order and payment emails
│   ├── orderConfirmation.ts
│   └── paymentConfirmation.ts
├── newsletters/              # Newsletter emails
│   ├── newsletter.ts
│   └── adminNewSubscriber.ts
└── rewards/                  # Reward notification emails
    ├── rewardGeneric.ts
    ├── rewardDiscount.ts
    └── rewardFreeCourse.ts
```

## Available Templates

### Authentication Emails

1. **Password Reset**
   - Sends a password reset link to the user
   - Includes expiration information and security notes

2. **Welcome Email**
   - Sent when a user registers or subscribes
   - Introduces the platform and sets expectations

3. **Unsubscribe Confirmation**
   - Confirms that a user has been unsubscribed
   - Provides an option to resubscribe

### Course Emails

1. **Course Enrollment**
   - Confirms enrollment in a course
   - Includes course details and access information

2. **Course Completion**
   - Congratulates the user on completing a course
   - Links to certificate if available
   - Recommends next courses

3. **Course Progress**
   - Sent at milestone points (25%, 50%, 75%)
   - Shows progress and encourages continuation

4. **Course Certificate**
   - Delivers the course completion certificate
   - Includes LinkedIn sharing options

### Order Emails

1. **Order Confirmation**
   - Confirms receipt of an order
   - Lists ordered items and payment details

2. **Payment Confirmation**
   - Confirms successful payment
   - Includes receipt and access information

### Newsletter Emails

1. **Newsletter**
   - Regular newsletter with content from the CMS
   - Supports Lexical rich text content

2. **Admin New Subscriber Notification**
   - Notifies administrators of new subscribers

### Reward Emails

1. **Generic Reward**
   - Base template for all rewards
   - Adaptable to different reward types

2. **Discount Reward**
   - Specialized template for discount codes
   - Includes discount details and usage instructions

3. **Free Course Reward**
   - Specialized template for free course access
   - Includes course details and access instructions

## Using Email Templates

### Basic Usage

```typescript
import { EmailService } from '@/services/email.service';
import { ServiceRegistry } from '@/services/service.registry';

// Get the email service
const emailService = ServiceRegistry.getInstance(payload).getEmailService();

// Send a password reset email
await emailService.sendPasswordResetEmail({
  email: 'user@example.com',
  name: 'John Doe',
  locale: 'en',
  resetToken: 'abc123'
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

### Advanced Usage

For more complex scenarios, you can use the template generator functions directly:

```typescript
import { generateCourseCompletionEmail } from '@/utilities/emailTemplates/courses/courseCompletion';

// Generate the email HTML
const html = generateCourseCompletionEmail({
  userName: 'John Doe',
  email: 'user@example.com',
  courseName: 'Advanced Flow Masters',
  courseId: 'course456',
  certificateId: 'cert123',
  completionDate: new Date().toISOString(),
  locale: 'en',
  siteUrl: 'https://flow-masters.ru'
});

// Use the HTML
console.log('Generated HTML:', html);

// Extract subject from HTML
const subjectMatch = html.match(/<title>(.*?)<\/title>/);
const subject = subjectMatch ? subjectMatch[1] : 'Default Subject';

// Send using your own method
sendEmail({
  to: 'user@example.com',
  subject,
  html
});
```

## Localization

All templates support localization with Russian and English as the default languages.

### How Localization Works

1. Each template accepts a `locale` parameter (defaults to 'ru')
2. Templates contain text objects for each supported language
3. The appropriate text is selected based on the locale

### Adding a New Language

To add support for a new language:

1. Add the new language texts to each template
2. Update the locale selection logic

Example:

```typescript
const texts = this.locale === 'ru' ? {
  // Russian texts
} : this.locale === 'en' ? {
  // English texts
} : this.locale === 'fr' ? {
  // French texts
} : {
  // Default to English
};
```

## Lexical Content Support

The email template system supports Lexical editor content from Payload CMS.

### How It Works

1. The `lexicalToHtml` utility converts Lexical content to HTML
2. Templates automatically detect and convert Lexical content
3. This allows rich text content created in the admin panel to be sent in emails

### Example

```typescript
// Content from Payload CMS Lexical editor
const lexicalContent = await payload.findByID({
  collection: 'email-templates',
  id: templateId,
});

// Send newsletter with Lexical content
await emailService.sendNewsletterEmail({
  email: 'user@example.com',
  title: 'Monthly Newsletter',
  content: lexicalContent.body, // This can be Lexical content
  locale: 'en'
});
```

## Customizing Templates

### Modifying Existing Templates

To modify an existing template:

1. Edit the template file in the appropriate directory
2. Update the `generateContent` method to change the content
3. Update the styling in the base template if needed

### Creating New Templates

To create a new template:

1. Create a new file in the appropriate directory
2. Define an interface extending `BaseEmailTemplateData`
3. Create a class extending `BaseEmailTemplate`
4. Implement the `generateContent` method
5. Export a generator function
6. Add the template to the `index.ts` exports

Example:

```typescript
import { BaseEmailTemplate, BaseEmailTemplateData } from '../baseEmailTemplate';

export interface MyNewEmailData extends BaseEmailTemplateData {
  userName: string;
  // Add other required fields
}

export class MyNewEmail extends BaseEmailTemplate<MyNewEmailData> {
  private userName: string;

  constructor(data: MyNewEmailData) {
    super(data);
    this.userName = data.userName;
  }

  protected generateContent() {
    const texts = this.locale === 'ru' ? {
      subject: 'Русская тема',
      greeting: `Здравствуйте, ${this.userName}!`,
      // Add other texts
    } : {
      subject: 'English subject',
      greeting: `Hello, ${this.userName}!`,
      // Add other texts
    };

    const bodyContent = `
      <h1>${texts.subject}</h1>
      <p>${texts.greeting}</p>
      <!-- Add more content -->
    `;

    const footerContent = `
      <p>Footer text</p>
    `;

    return {
      subject: texts.subject,
      bodyContent,
      footerContent
    };
  }
}

export function generateMyNewEmail(data: MyNewEmailData): string {
  const email = new MyNewEmail(data);
  return email.generateHTML();
}
```

## Testing Templates

### Preview Mode

To preview templates during development:

1. Use the `generateHTML` method to get the HTML
2. Save it to a file or view it in a browser

### Email Testing Tools

Recommended tools for testing emails:

1. **Litmus**: For testing across multiple email clients
2. **Email on Acid**: For email rendering tests
3. **Mailtrap**: For capturing test emails in development

### Development Environment

In development mode, emails are not sent but captured for preview:

1. Check the console for preview URLs
2. Click the URL to view the email in a browser

To enable real email sending in development:

1. Set `USE_REAL_EMAIL_IN_DEV=true` in your `.env.local` file
2. Configure SMTP settings as described in `docs/email-setup.md`
